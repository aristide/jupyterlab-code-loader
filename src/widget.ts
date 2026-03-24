/**
 * CodeLoaderWidget: main sidebar widget.
 *
 * Builds the full sidebar UI, handles data loading, kernel-aware filtering,
 * search, and user actions (copy/open, insert snippet, refresh).
 */

import { Widget } from '@lumino/widgets';
import { JupyterFrontEnd } from '@jupyterlab/application';
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
import { TabType, createTabBar } from './components/TabBar';
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

const DEFAULT_LABELS: Record<string, string> = {
  'sidebar.title': 'Examples & snippets',
  'tab.code': 'Code examples',
  'tab.snippets': 'Snippets',
  'search.code.placeholder': 'Search code examples...',
  'search.snippets.placeholder': 'Search snippets...',
  'status.lastSync': 'Last synced {time} ago',
  'status.refresh': 'Refresh',
  'action.copyToWorkspace': 'Copy to workspace',
  'action.openInEditor': 'Open in editor',
  'action.insertSnippet': 'Insert snippet',
  'action.copyToClipboard': 'Copy to clipboard',
  'difficulty.beginner': 'beginner',
  'difficulty.intermediate': 'intermediate',
  'difficulty.advanced': 'advanced',
  'locale.fallbackNotice': 'Translation unavailable \u2014 English version',
  'locale.translated': 'Translated',
  'kernel.detected': 'Kernel {name} detected',
  'kernel.none': 'No notebook active',
  'filter.shown': '{n} shown',
  'filter.hidden': '{n} hidden ({lang})',
  'filter.noFilter': 'no filter'
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

  // Cached data (all items, pre-filter)
  private domains: IDomainSummary[] = [];
  private allCodeItems: Map<string, ICodeItem[]> = new Map();
  private allSnippetItems: Map<string, ISnippetFile[]> = new Map();
  private lastSync: string | null = null;

  // Config flags
  private allowReset = false;

  // DOM references
  private headerEl: HTMLElement | null = null;
  private kernelIndicatorEl: HTMLElement | null = null;
  private searchBarEl: HTMLElement | null = null;
  private contentEl: HTMLElement | null = null;
  private statusBarEl: HTMLElement | null = null;

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
    // Check if extension is configured
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

    // Load UI labels, then build UI and load data
    await this._loadUILabels();
    this._buildUI();
    await this._loadRegistry();
  }

  // ---- UI label translation ----

  private async _loadUILabels(): Promise<void> {
    try {
      const labels = await requestAPI<Record<string, string>>('i18n');
      this.uiLabels = { ...DEFAULT_LABELS, ...labels };
    } catch {
      // Keep defaults
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

  // ---- Setup Form ----

  private _renderSetupForm(): void {
    this.node.innerHTML = '';
    const form = createSetupForm(() => {
      this.node.innerHTML = '';
      this._initialize();
    });
    this.node.appendChild(form);
  }

  // ---- UI Building ----

  private _buildUI(): void {
    this.node.innerHTML = '';

    // Header
    this.headerEl = document.createElement('div');
    this.headerEl.className = 'jp-CodeLoader-header';

    const titleEl = document.createElement('h2');
    titleEl.className = 'jp-CodeLoader-title';
    titleEl.textContent = this._t('sidebar.title');

    this.headerEl.appendChild(titleEl);

    if (this.allowReset) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'jp-CodeLoader-resetBtn';
      resetBtn.title = 'Reset configuration';
      resetBtn.innerHTML =
        '<svg viewBox="0 0 16 16" width="14" height="14">' +
        '<path fill="currentColor" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h5.75a.75.75 0 0 1' +
        ' .53.22l3.5 3.5a.75.75 0 0 1 .22.53V12.5A2.5 2.5 0 0 1 12 15H4.5A2.5' +
        ' 2.5 0 0 1 2 12.5v-10zm6.75 4.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0' +
        ' 1.5 0v-2.5zM8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>';
      resetBtn.addEventListener('click', () => {
        this._handleReset();
      });
      this.headerEl.appendChild(resetBtn);
    }

    // Kernel indicator
    this.kernelIndicatorEl = createKernelIndicator(
      this.activeCodeLang,
      this.activeKernelName,
      {
        detected: this._t('kernel.detected'),
        none: this._t('kernel.none')
      }
    );

    // Tab bar
    const tabBar = createTabBar(
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

    // Search bar
    this.searchBarEl = createSearchBar((query: string) => {
      this.currentQuery = parseSearchQuery(query);
      this._renderContent();
    }, this._t('search.code.placeholder'));

    // Content area (scrollable)
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'jp-CodeLoader-content';

    // Status bar (will be created after data loads)
    this.statusBarEl = document.createElement('div');
    this.statusBarEl.className = 'jp-CodeLoader-statusContainer';

    // Assemble
    this.node.appendChild(this.headerEl);
    this.node.appendChild(this.kernelIndicatorEl);
    this.node.appendChild(tabBar);
    this.node.appendChild(this.searchBarEl);
    this.node.appendChild(this.contentEl);
    this.node.appendChild(this.statusBarEl);
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

      // Load code and snippets for each domain in parallel
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

      // Get sync status
      try {
        const status = await requestAPI<any>('status');
        this.lastSync = status.last_sync;
      } catch {
        // Ignore
      }

      this._renderContent();
      this._renderStatusBar();
    } catch (e) {
      if (this.contentEl) {
        this.contentEl.innerHTML =
          '<div class="jp-CodeLoader-error">Failed to load content. Check the repository configuration.</div>';
      }
    }
  }

  // ---- Rendering ----

  private _renderContent(): void {
    if (!this.contentEl) {
      return;
    }
    this.contentEl.innerHTML = '';

    if (this.currentTab === 'code') {
      this._renderCodeTab();
    } else {
      this._renderSnippetsTab();
    }

    this._renderStatusBar();
  }

  private _renderCodeTab(): void {
    if (!this.contentEl) {
      return;
    }

    const difficultyLabels: Record<string, string> = {
      beginner: this._t('difficulty.beginner'),
      intermediate: this._t('difficulty.intermediate'),
      advanced: this._t('difficulty.advanced')
    };

    for (const domain of this.domains) {
      const allItems = this.allCodeItems.get(domain.id) || [];

      // Apply filters
      const filtered = allItems.filter(item =>
        matchesCodeItem(item, this.currentQuery, this.activeCodeLang)
      );
      const hidden = allItems.length - filtered.length;

      const accordion = createDomainAccordion(
        domain.name,
        filtered.length,
        hidden,
        filtered.length > 0
      );

      const content = getAccordionContent(accordion);
      for (const item of filtered) {
        const row = createCodeItemRow(
          item,
          domain.id,
          (d, f) => this._openCodeExample(d, f),
          difficultyLabels
        );
        content.appendChild(row);
      }

      if (hidden > 0) {
        const notice = document.createElement('div');
        notice.className = 'jp-CodeLoader-hiddenNotice';
        notice.textContent = `${hidden} hidden`;
        content.appendChild(notice);
      }

      this.contentEl.appendChild(accordion);
    }
  }

  private _renderSnippetsTab(): void {
    if (!this.contentEl) {
      return;
    }

    for (const domain of this.domains) {
      const allFiles = this.allSnippetItems.get(domain.id) || [];

      // Filter snippets within each file
      let totalVisible = 0;
      const filteredFiles: Array<{
        file: ISnippetFile;
        snippets: ISnippet[];
      }> = [];

      for (const file of allFiles) {
        const filtered = file.snippets.filter(s =>
          matchesSnippet(s, this.currentQuery, this.activeCodeLang)
        );
        if (filtered.length > 0) {
          filteredFiles.push({ file, snippets: filtered });
          totalVisible += filtered.length;
        }
      }

      const accordion = createDomainAccordion(
        domain.name,
        totalVisible,
        0,
        totalVisible > 0
      );

      const content = getAccordionContent(accordion);
      for (const { snippets } of filteredFiles) {
        for (const snippet of snippets) {
          const row = createSnippetRow(
            snippet,
            s => this._insertSnippet(s),
            s => this._copyToClipboard(s),
            s => this._copyForTerminal(s)
          );
          content.appendChild(row);
        }
      }

      this.contentEl.appendChild(accordion);
    }
  }

  private _renderStatusBar(): void {
    if (!this.statusBarEl) {
      return;
    }
    this.statusBarEl.innerHTML = '';

    // Count totals
    let shown = 0;
    let total = 0;

    if (this.currentTab === 'code') {
      for (const domain of this.domains) {
        const allItems = this.allCodeItems.get(domain.id) || [];
        total += allItems.length;
        shown += allItems.filter(item =>
          matchesCodeItem(item, this.currentQuery, this.activeCodeLang)
        ).length;
      }
    } else {
      for (const domain of this.domains) {
        const allFiles = this.allSnippetItems.get(domain.id) || [];
        for (const file of allFiles) {
          total += file.snippets.length;
          shown += file.snippets.filter(s =>
            matchesSnippet(s, this.currentQuery, this.activeCodeLang)
          ).length;
        }
      }
    }

    const statusBar = createStatusBar(
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
        noFilter: this._t('filter.noFilter')
      }
    );

    this.statusBarEl.appendChild(statusBar);
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
      // Check kernel compatibility
      const session = notebook.sessionContext;
      const kernelName = session.session?.kernel?.name || null;
      const nbLang = kernelToCodeLang(kernelName);

      if (!nbLang || nbLang === snippet.code_lang) {
        // Compatible — insert into active cell
        this._insertCodeIntoNotebook(notebook, code);
        return;
      }
    }

    // No notebook or incompatible kernel — create a new one
    await this._createNotebookAndInsert(snippet.code_lang, code);
  }

  private _insertCodeIntoNotebook(notebook: any, code: string): void {
    const nbModel = notebook.content.model;
    if (!nbModel) {
      return;
    }
    const activeIndex = notebook.content.activeCellIndex;
    const activeCell = notebook.content.activeCell;

    // If the active cell is empty, replace its content
    if (activeCell && !activeCell.model.sharedModel.getSource().trim()) {
      activeCell.model.sharedModel.setSource(code);
    } else {
      // Insert a new cell below
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
      await this.app.commands.execute('notebook:create-new', {
        kernelName
      });

      // Wait for the new notebook to appear
      const nb = this.notebookTracker?.currentWidget;
      if (nb) {
        await nb.sessionContext.ready;
        this._insertCodeIntoNotebook(nb, code);
      }
    } catch (e) {
      console.error('Failed to create notebook for snippet:', e);
      // Last resort: copy to clipboard
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // ignore
      }
    }
  }

  private async _copyToClipboard(snippet: ISnippet): Promise<void> {
    const code =
      snippet.imports.length > 0
        ? snippet.imports.join('\n') + '\n\n' + snippet.code
        : snippet.code;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      console.warn('Clipboard API not available');
    }
  }

  private async _copyForTerminal(snippet: ISnippet): Promise<void> {
    const lines: string[] = [];
    if (snippet.imports.length > 0) {
      lines.push(...snippet.imports);
    }
    lines.push(...snippet.code.split('\n').filter((l: string) => l.trim()));

    // Join as a single pasteable command with && separators
    const terminal = lines.length > 1 ? lines.join(' && ') : lines[0] || '';

    try {
      await navigator.clipboard.writeText(terminal);
    } catch {
      console.warn('Clipboard API not available');
    }
  }

  private async _refreshCache(): Promise<void> {
    try {
      await requestAPI('refresh', { method: 'POST' });
      // Clear caches and reload
      this.allCodeItems.clear();
      this.allSnippetItems.clear();
      await this._loadRegistry();
    } catch (e) {
      console.error('Failed to refresh cache:', e);
    }
  }

  private async _handleReset(): Promise<void> {
    const confirmed = window.confirm(
      'Reset configuration? This will clear all settings and return to the setup form.'
    );
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
