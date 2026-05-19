/**
 * CodeLoaderWidget: main sidebar widget.
 *
 * Composes the Data4Now panel layout — top toolbar → subheader (kernel
 * filter + tab row) → search → scrollable browse body → sync bar.
 */

import { Widget } from '@lumino/widgets';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { Clipboard } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { requestAPI } from './handler';
import { kernelToCodeLang, codeLangToKernel } from './kernel_map';
import {
  ICodeItem,
  ISnippetFile,
  ISnippet,
  ICodeListResponse,
  ISnippetListResponse,
  IConfig,
  IDomainSummary
} from './model';
import {
  parseSearchQuery,
  matchesCodeItem,
  matchesSnippet,
  IParsedQuery
} from './search';
import { TabType, createTabBar, updateTabCount } from './components/TabBar';
import {
  createSearchBar,
  updateSearchPlaceholder
} from './components/SearchBar';
import {
  createKernelIndicator,
  updateKernelIndicator
} from './components/KernelIndicator';
import {
  createDomainAccordion,
  getAccordionContent
} from './components/DomainAccordion';
import { createCodeItemRow } from './components/CodeItemRow';
import { createSnippetRow } from './components/SnippetRow';
import { createStatusBar } from './components/StatusBar';
import { createSetupForm } from './components/SetupForm';
import { createTopBar } from './components/TopBar';
import { Svg } from './svg_icons';

const DEFAULT_LABELS: Record<string, string> = {
  // Sidebar
  'sidebar.title': 'Code & snippets',
  'sidebar.caption': 'Code & Snippets',
  // Tabs
  'tab.code': 'Code examples',
  'tab.snippets': 'Snippets',
  // Search
  'search.code.placeholder': 'Search code examples…',
  'search.snippets.placeholder': 'Search snippets…',
  // Status bar
  'status.lastSync': 'Last synced {time} ago',
  'status.refresh': 'Refresh',
  'status.justNow': 'just now',
  // Difficulty
  'difficulty.beginner': 'beginner',
  'difficulty.intermediate': 'intermediate',
  'difficulty.advanced': 'advanced',
  // Locale
  'locale.fallbackNotice': 'Translation unavailable — English version',
  'locale.translated': 'Translated',
  // Kernel
  'kernel.detected': '{name}',
  'kernel.none': 'No notebook active',
  // Filters
  'filter.shown': '{n} shown',
  'filter.hidden': '{n} hidden ({lang})',
  'filter.noFilter': 'no filter',
  // Code item row
  'code.tooltip.notebook': 'Notebook',
  'code.tooltip.python': 'Python script',
  'code.tooltip.r': 'R script',
  'code.tooltip.bash': 'Bash script',
  'code.tooltip.script': 'Script',
  'code.button.open': 'Copy to workspace and open',
  'code.badge.translated': 'Translated',
  'code.type.notebook': 'notebook',
  'code.type.script': 'script',
  // Snippet row
  'snippet.button.insert': 'Insert into notebook',
  'snippet.button.terminal': 'Send to terminal',
  'snippet.button.copy': 'Copy to clipboard',
  // Setup form
  'setup.title': 'Connect a repository',
  'setup.desc':
    'Link a Git repository to browse code examples and reusable snippets.',
  'setup.desc.rich':
    'Link a Git repo to browse <strong>code examples</strong> and <strong>reusable snippets</strong> from inside your notebook.',
  'setup.section.repo': 'Repository',
  'setup.field.url': 'Clone URL',
  'setup.field.url.placeholder': 'https://github.com/org/examples.git',
  'setup.field.url.hint': 'HTTPS or SSH clone URL.',
  'setup.field.url.invalid':
    "Doesn't look like an HTTPS or SSH clone URL. Try https://…/repo.git or git@…:owner/repo.git.",
  'setup.field.url.on': 'on',
  'setup.field.branch': 'Branch',
  'setup.field.branch.hint': 'Target branch to track. Leave as main if unsure.',
  'setup.field.branch.hint.rich':
    'Target branch to track. Leave as <code class="jp-CodeLoader-codeChip">main</code> if unsure.',
  'setup.section.auth': 'Authentication',
  'setup.section.auth.hint':
    'Required for private repositories. Public repos clone anonymously.',
  'setup.auth.public': 'Public',
  'setup.auth.token': 'Token',
  'setup.auth.basic': 'Login',
  'setup.field.token': 'Personal access token',
  'setup.field.token.placeholder': 'ghp_… or glpat-…',
  'setup.field.token.hint':
    'Stored in your JupyterLab keyring — never written to disk in plain text.',
  'setup.field.username': 'Username',
  'setup.field.username.placeholder': 'your-username',
  'setup.field.password': 'Password',
  'setup.field.password.placeholder': '••••••••',
  'setup.field.basic.hint':
    'Credentials stored in your JupyterLab keyring — never written to disk in plain text.',
  'setup.field.required': 'Required',
  'setup.action.paste': 'Paste from clipboard',
  'setup.action.showToken': 'Show token',
  'setup.action.hideToken': 'Hide token',
  'setup.action.showPassword': 'Show password',
  'setup.action.hidePassword': 'Hide password',
  'setup.public.strong': 'Anonymous clone.',
  'setup.public.desc':
    'Only public repositories will load. Branch list and rate limits follow the host’s unauthenticated quotas.',
  'setup.button.test': 'Test',
  'setup.button.connect': 'Connect repository',
  'setup.test.resolving': 'Resolving {repo}#{branch}…',
  'setup.test.testing': 'Testing…',
  'setup.test.urlOk': 'Looks like a valid {provider} clone URL for {repo}.',
  'setup.test.branchOk': '{repo} on {provider} — branch {branch} found.',
  'setup.test.branchNotFound': 'Branch {branch} not found on {repo}.',
  'setup.test.repoNotFound': 'Repository {repo} not found or not accessible.',
  'setup.test.authRequired':
    'Authentication required to access {repo} — switch to Token or Login.',
  'setup.test.authFailed': 'Authentication failed — check your credentials.',
  'setup.test.rateLimited':
    'Host rate-limited the request — try again in a minute or sign in.',
  'setup.test.networkError': 'Connection failed: {error}',
  'setup.test.needsToken':
    'Token required — enter a token or switch to Public.',
  'setup.test.needsBasic':
    'Username and password required — fill both or switch to Public.',
  'setup.bottom.hint': 'Read-only by default.',
  'setup.error.urlRequired': 'Repository URL is required.',
  'setup.status.cloning': 'Cloning…',
  'setup.status.connected': 'Connected — loading content…',
  'setup.error.connectionFailed': 'Connection failed: {error}',
  // Reset
  'reset.confirm':
    'Reset configuration? This will clear all settings and return to the setup form.',
  'reset.title': 'Reset configuration',
  // Errors
  'error.loadFailed':
    'Failed to load content. Check the repository configuration.',
  // Hidden items
  'hidden.notice': '{n} hidden',
  // Empty
  'empty.title': 'Nothing here yet.',
  'empty.sub': 'Try a different query or clear the filter.'
};

export class CodeLoaderWidget extends Widget {
  private app: JupyterFrontEnd;
  private notebookTracker: INotebookTracker | null;
  private locale: string;
  private currentTab: TabType = 'code';
  private uiLabels: Record<string, string> = { ...DEFAULT_LABELS };

  // Kernel state
  private activeKernelName: string | null = null;
  private activeCodeLang: string | null = null;

  // Search state
  private currentQuery: IParsedQuery = parseSearchQuery('');

  // Cached data
  private domains: IDomainSummary[] = [];
  private allCodeItems: Map<string, ICodeItem[]> = new Map();
  private allSnippetItems: Map<string, ISnippetFile[]> = new Map();
  private lastSync: string | null = null;

  // Config
  private allowReset = false;

  // DOM references
  private topbarEl: HTMLElement | null = null;
  private subheaderEl: HTMLElement | null = null;
  private kernelIndicatorEl: HTMLElement | null = null;
  private tabBarEl: HTMLElement | null = null;
  private searchBarEl: HTMLElement | null = null;
  private browseEl: HTMLElement | null = null;
  private syncbarEl: HTMLElement | null = null;

  constructor(
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker | null,
    locale: string
  ) {
    super();
    this.app = app;
    this.notebookTracker = notebookTracker;
    this.locale = locale;
    this.addClass('jp-CodeLoader');
    this._initialize();
  }

  private async _initialize(): Promise<void> {
    await this._loadUILabels();

    try {
      const config = await requestAPI<IConfig>('config');
      this.allowReset = config.allow_reset;
      if (!config.is_configured) {
        this._renderSetupForm();
        return;
      }
    } catch {
      this._renderSetupForm();
      return;
    }

    this._buildUI();
    await this._loadRegistry();
  }

  // ---- UI label translation ----

  private async _loadUILabels(): Promise<void> {
    try {
      const labels = await requestAPI<Record<string, string>>('i18n');
      this.uiLabels = { ...DEFAULT_LABELS, ...labels };
    } catch {
      // keep defaults
    }
  }

  private _t(key: string, vars?: Record<string, string>): string {
    let text = this.uiLabels[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, v);
      }
    }
    return text;
  }

  // ---- Setup form ----

  private _renderSetupForm(): void {
    this.node.innerHTML = '';
    const form = createSetupForm(() => {
      this.node.innerHTML = '';
      this._initialize();
    }, this.uiLabels);

    // The form uses display: contents so its children participate as direct
    // flex items of .jp-CodeLoader. Append the children individually instead
    // of relying on the empty wrapper.
    while (form.firstChild) {
      this.node.appendChild(form.firstChild);
    }
  }

  // ---- Connected layout ----

  private _buildUI(): void {
    this.node.innerHTML = '';

    // Top toolbar with optional reset action
    const actions = this.allowReset
      ? [
          {
            icon: Svg.trash,
            title: this._t('reset.title'),
            onClick: () => this._handleReset()
          }
        ]
      : [];
    this.topbarEl = createTopBar(
      this._t('sidebar.title'),
      'code-loader',
      actions
    );

    // Subheader with kernel filter + tabs
    this.subheaderEl = document.createElement('div');
    this.subheaderEl.className = 'jp-CodeLoader-subheader';

    this.kernelIndicatorEl = createKernelIndicator(
      this.activeCodeLang,
      this.activeKernelName,
      {
        detected: this._t('kernel.detected'),
        none: this._t('kernel.none')
      }
    );
    this.subheaderEl.appendChild(this.kernelIndicatorEl);

    this.tabBarEl = createTabBar(
      (tab: TabType) => {
        this.currentTab = tab;
        this._updateSearchPlaceholder();
        this._renderContent();
      },
      {
        code: this._t('tab.code'),
        snippets: this._t('tab.snippets')
      }
    );
    this.subheaderEl.appendChild(this.tabBarEl);

    // Search bar
    this.searchBarEl = createSearchBar((query: string) => {
      this.currentQuery = parseSearchQuery(query);
      this._renderContent();
    }, this._t('search.code.placeholder'));

    // Browse body (scrollable list)
    this.browseEl = document.createElement('div');
    this.browseEl.className = 'jp-CodeLoader-browse';

    // Sync bar
    this.syncbarEl = document.createElement('div');
    this.syncbarEl.style.display = 'contents';

    this.node.appendChild(this.topbarEl);
    this.node.appendChild(this.subheaderEl);
    this.node.appendChild(this.searchBarEl);
    this.node.appendChild(this.browseEl);
    this.node.appendChild(this.syncbarEl);
  }

  private _updateSearchPlaceholder(): void {
    if (this.searchBarEl) {
      const key =
        this.currentTab === 'code'
          ? 'search.code.placeholder'
          : 'search.snippets.placeholder';
      updateSearchPlaceholder(this.searchBarEl, this._t(key));
    }
  }

  // ---- Kernel-aware filtering ----

  setActiveKernel(kernelName: string | null): void {
    const newCodeLang = kernelToCodeLang(kernelName);
    if (newCodeLang === this.activeCodeLang) {
      return;
    }
    this.activeKernelName = kernelName;
    this.activeCodeLang = newCodeLang;

    if (this.kernelIndicatorEl) {
      updateKernelIndicator(
        this.kernelIndicatorEl,
        this.activeCodeLang,
        this.activeKernelName,
        {
          detected: this._t('kernel.detected'),
          none: this._t('kernel.none')
        }
      );
    }
    this._renderContent();
  }

  // ---- Data loading ----

  private async _loadRegistry(): Promise<void> {
    try {
      const registry = await requestAPI<any>('registry');
      this.domains = registry.domains || [];

      const promises = this.domains.map(async (domain: IDomainSummary) => {
        try {
          const codeResp = await requestAPI<ICodeListResponse>(
            `domains/${domain.id}/code`
          );
          this.allCodeItems.set(domain.id, codeResp.items);
        } catch {
          this.allCodeItems.set(domain.id, []);
        }
        try {
          const snippetResp = await requestAPI<ISnippetListResponse>(
            `domains/${domain.id}/snippets`
          );
          this.allSnippetItems.set(domain.id, snippetResp.items);
        } catch {
          this.allSnippetItems.set(domain.id, []);
        }
      });
      await Promise.all(promises);

      try {
        const status = await requestAPI<any>('status');
        this.lastSync = status.last_sync;
      } catch {
        // ignore
      }

      this._renderContent();
      this._renderSyncBar();
    } catch (e) {
      if (this.browseEl) {
        const err = document.createElement('div');
        err.className = 'jp-CodeLoader-error';
        err.textContent = this._t('error.loadFailed');
        this.browseEl.innerHTML = '';
        this.browseEl.appendChild(err);
      }
    }
  }

  // ---- Render ----

  private _renderContent(): void {
    if (!this.browseEl) {
      return;
    }
    this.browseEl.innerHTML = '';

    // Update tab counts (across all domains, before search)
    if (this.tabBarEl) {
      let codeTotal = 0;
      let snippetTotal = 0;
      for (const domain of this.domains) {
        codeTotal += (this.allCodeItems.get(domain.id) || []).length;
        for (const file of this.allSnippetItems.get(domain.id) || []) {
          snippetTotal += file.snippets.length;
        }
      }
      updateTabCount(this.tabBarEl, 'code', codeTotal);
      updateTabCount(this.tabBarEl, 'snippets', snippetTotal);
    }

    if (this.currentTab === 'code') {
      this._renderCodeTab();
    } else {
      this._renderSnippetsTab();
    }

    this._renderSyncBar();
  }

  private _renderCodeTab(): void {
    if (!this.browseEl) {
      return;
    }
    const difficultyLabels: Record<string, string> = {
      beginner: this._t('difficulty.beginner'),
      intermediate: this._t('difficulty.intermediate'),
      advanced: this._t('difficulty.advanced')
    };

    let renderedAny = false;
    for (const domain of this.domains) {
      const allItems = this.allCodeItems.get(domain.id) || [];
      const filtered = allItems.filter(item =>
        matchesCodeItem(item, this.currentQuery, this.activeCodeLang)
      );
      const hidden = allItems.length - filtered.length;
      if (allItems.length === 0) {
        continue;
      }

      const accordion = createDomainAccordion(
        domain.name,
        filtered.length,
        0,
        filtered.length > 0
      );
      const content = getAccordionContent(accordion);
      for (const item of filtered) {
        const row = createCodeItemRow(
          item,
          domain.id,
          (d, f) => this._openCodeExample(d, f),
          difficultyLabels,
          this.uiLabels
        );
        content.appendChild(row);
      }
      if (hidden > 0) {
        const notice = document.createElement('div');
        notice.className = 'jp-CodeLoader-hiddenNotice';
        notice.textContent = this._t('hidden.notice', { n: String(hidden) });
        content.appendChild(notice);
      }
      this.browseEl.appendChild(accordion);
      renderedAny = renderedAny || filtered.length > 0;
    }

    if (!renderedAny) {
      this._renderEmpty();
    }
  }

  private _renderSnippetsTab(): void {
    if (!this.browseEl) {
      return;
    }

    let renderedAny = false;
    for (const domain of this.domains) {
      const allFiles = this.allSnippetItems.get(domain.id) || [];
      let visible = 0;
      const filtered: Array<{ file: ISnippetFile; snippets: ISnippet[] }> = [];
      for (const file of allFiles) {
        const list = file.snippets.filter(s =>
          matchesSnippet(s, this.currentQuery, this.activeCodeLang)
        );
        if (list.length > 0) {
          filtered.push({ file, snippets: list });
          visible += list.length;
        }
      }
      if (allFiles.length === 0) {
        continue;
      }

      const accordion = createDomainAccordion(
        domain.name,
        visible,
        0,
        visible > 0
      );
      const content = getAccordionContent(accordion);
      for (const { snippets } of filtered) {
        for (const snippet of snippets) {
          const row = createSnippetRow(
            snippet,
            s => this._insertSnippet(s),
            s => this._copyToClipboard(s),
            s => this._copyForTerminal(s),
            this.uiLabels
          );
          content.appendChild(row);
        }
      }
      this.browseEl.appendChild(accordion);
      renderedAny = renderedAny || visible > 0;
    }

    if (!renderedAny) {
      this._renderEmpty();
    }
  }

  private _renderEmpty(): void {
    if (!this.browseEl) {
      return;
    }
    const empty = document.createElement('div');
    empty.className = 'jp-CodeLoader-empty';
    empty.innerHTML = `${Svg.search}<strong>${this._t('empty.title')}</strong><span>${this._t('empty.sub')}</span>`;
    this.browseEl.appendChild(empty);
  }

  private _renderSyncBar(): void {
    if (!this.syncbarEl) {
      return;
    }
    this.syncbarEl.innerHTML = '';

    let shown = 0;
    let total = 0;
    if (this.currentTab === 'code') {
      for (const domain of this.domains) {
        const all = this.allCodeItems.get(domain.id) || [];
        total += all.length;
        shown += all.filter(i =>
          matchesCodeItem(i, this.currentQuery, this.activeCodeLang)
        ).length;
      }
    } else {
      for (const domain of this.domains) {
        const files = this.allSnippetItems.get(domain.id) || [];
        for (const file of files) {
          total += file.snippets.length;
          shown += file.snippets.filter(s =>
            matchesSnippet(s, this.currentQuery, this.activeCodeLang)
          ).length;
        }
      }
    }

    const bar = createStatusBar(
      this.lastSync,
      shown,
      total - shown,
      this.activeCodeLang,
      () => this._refreshCache(),
      {
        lastSync: this._t('status.lastSync'),
        refresh: this._t('status.refresh'),
        shown: this._t('filter.shown'),
        hidden: this._t('filter.hidden'),
        noFilter: this._t('filter.noFilter'),
        justNow: this._t('status.justNow')
      }
    );
    this.syncbarEl.appendChild(bar);
  }

  // ---- Actions ----

  private async _openCodeExample(domain: string, file: string): Promise<void> {
    try {
      const result = await requestAPI<any>('copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, file, locale: this.locale })
      });
      const factory = file.endsWith('.ipynb') ? undefined : 'Editor';
      await this.app.commands.execute('docmanager:open', {
        path: result.path,
        factory
      });
    } catch (e) {
      console.error('Failed to open code example:', e);
    }
  }

  private async _insertSnippet(snippet: ISnippet): Promise<void> {
    const code =
      snippet.imports.length > 0
        ? snippet.imports.join('\n') + '\n\n' + snippet.code
        : snippet.code;

    const notebook = this.notebookTracker?.currentWidget;

    if (notebook) {
      const session = notebook.sessionContext;
      const kernelName = session.session?.kernel?.name || null;
      const nbLang = kernelToCodeLang(kernelName);

      if (!nbLang || nbLang === snippet.code_lang) {
        this._insertCodeIntoNotebook(notebook, code);
        return;
      }
    }

    await this._createNotebookAndInsert(snippet.code_lang, code);
  }

  private _insertCodeIntoNotebook(notebook: any, code: string): void {
    const nbModel = notebook.content.model;
    if (!nbModel) {
      return;
    }
    const activeIndex = notebook.content.activeCellIndex;
    const activeCell = notebook.content.activeCell;

    if (!activeCell) {
      nbModel.sharedModel.insertCell(activeIndex + 1, {
        cell_type: 'code',
        source: code
      });
      notebook.content.activeCellIndex = activeIndex + 1;
      return;
    }

    const source = activeCell.model.sharedModel.getSource();
    if (!source.trim()) {
      activeCell.model.sharedModel.setSource(code);
    } else if (activeCell.editor) {
      const editor = activeCell.editor;
      const cursor = editor.getCursorPosition();
      const offset = editor.getOffsetAt(cursor);
      const newSource = source.slice(0, offset) + code + source.slice(offset);
      activeCell.model.sharedModel.setSource(newSource);
    } else {
      nbModel.sharedModel.insertCell(activeIndex + 1, {
        cell_type: 'code',
        source: code
      });
      notebook.content.activeCellIndex = activeIndex + 1;
    }
  }

  private async _createNotebookAndInsert(
    codeLang: string,
    code: string
  ): Promise<void> {
    try {
      const kernelName = codeLangToKernel(codeLang);
      await this.app.commands.execute('notebook:create-new', { kernelName });
      const nb = this.notebookTracker?.currentWidget;
      if (nb) {
        await nb.sessionContext.ready;
        this._insertCodeIntoNotebook(nb, code);
      }
    } catch (e) {
      console.error('Failed to create notebook for snippet:', e);
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // ignore
      }
    }
  }

  private _copyToClipboard(snippet: ISnippet): void {
    const code =
      snippet.imports && snippet.imports.length > 0
        ? snippet.imports.join('\n') + '\n\n' + snippet.code
        : snippet.code;
    this._toClipboard(code);
  }

  private async _copyForTerminal(snippet: ISnippet): Promise<void> {
    const lines: string[] = [];
    if (snippet.imports && snippet.imports.length > 0) {
      lines.push(...snippet.imports);
    }
    lines.push(...snippet.code.split('\n').filter((l: string) => l.trim()));
    const command = lines.length > 1 ? lines.join(' && ') : lines[0] || '';

    try {
      const terminals = this.app.serviceManager.terminals;
      await terminals.ready;

      let termModel: any;
      const running = Array.from(terminals.running());
      if (running.length > 0) {
        termModel = running[0];
      } else {
        termModel = await terminals.startNew();
      }
      await this.app.commands.execute('terminal:open', {
        name: termModel.name
      });
      const connection = terminals.connectTo({ model: termModel });
      connection.send({ type: 'stdin', content: [command] });
    } catch (e) {
      console.error('[CodeLoader] Failed to send to terminal:', e);
      this._toClipboard(command);
    }
  }

  private _toClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => console.log('[CodeLoader] Copied to clipboard'),
        () => Clipboard.copyToSystem(text)
      );
    } else {
      Clipboard.copyToSystem(text);
    }
  }

  private async _refreshCache(): Promise<void> {
    try {
      await requestAPI('refresh', { method: 'POST' });
      this.allCodeItems.clear();
      this.allSnippetItems.clear();
      await this._loadRegistry();
    } catch (e) {
      console.error('Failed to refresh cache:', e);
    }
  }

  private async _handleReset(): Promise<void> {
    const confirmed = window.confirm(this._t('reset.confirm'));
    if (!confirmed) {
      return;
    }
    try {
      await requestAPI('config', { method: 'DELETE' });
      this.allCodeItems.clear();
      this.allSnippetItems.clear();
      this.domains = [];
      this._renderSetupForm();
    } catch (e) {
      console.error('Failed to reset configuration:', e);
    }
  }
}
