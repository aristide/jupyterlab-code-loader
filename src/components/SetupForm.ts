/**
 * Setup form — Data4Now Connect a repository panel.
 * Composes a fixed top toolbar, scrollable body (intro + repo + auth sections),
 * and a fixed bottom toolbar with Test + Connect actions.
 */

import { requestAPI } from '../handler';
import {
  Svg,
  parseRepoUrl,
  providerIcon,
  providerLabel,
  IParsedRepo
} from '../svg_icons';
import { createTopBar } from './TopBar';

type Labels = Record<string, string>;
type AuthMode = 'public' | 'token' | 'basic';

function _l(
  labels: Labels,
  key: string,
  vars?: Record<string, string>
): string {
  let text = labels[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export function createSetupForm(
  onConfigSaved: () => void,
  labels: Labels
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-setupForm';
  container.style.display = 'contents';

  // Top toolbar
  const topbar = createTopBar(_l(labels, 'setup.title'), 'code-loader', []);

  // Body
  const body = document.createElement('div');
  body.className = 'jp-CodeLoader-body';

  const intro = document.createElement('p');
  intro.className = 'jp-CodeLoader-intro';
  intro.innerHTML = _l(labels, 'setup.desc.rich');
  body.appendChild(intro);

  // ── Repository section ──
  const repoSection = _createSection(_l(labels, 'setup.section.repo'));
  const repoCard = document.createElement('div');
  repoCard.className = 'jp-CodeLoader-card';
  repoSection.appendChild(repoCard);

  // URL field
  const urlField = document.createElement('div');
  urlField.className = 'jp-CodeLoader-field';

  const urlLabelRow = _createLabelRow(
    _l(labels, 'setup.field.url'),
    _l(labels, 'setup.field.required'),
    'cl-url'
  );
  urlField.appendChild(urlLabelRow);

  const urlInputWrap = document.createElement('div');
  urlInputWrap.className = 'jp-CodeLoader-input';

  const urlPrefix = document.createElement('span');
  urlPrefix.className = 'jp-CodeLoader-inputPrefix';
  urlPrefix.innerHTML = Svg.link;
  urlInputWrap.appendChild(urlPrefix);

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.id = 'cl-url';
  urlInput.placeholder = _l(labels, 'setup.field.url.placeholder');
  urlInput.dataset.field = 'repo_url';
  urlInput.autocomplete = 'off';
  urlInput.spellcheck = false;
  urlInput.required = true;
  urlInputWrap.appendChild(urlInput);

  const urlChip = document.createElement('span');
  urlChip.className = 'jp-CodeLoader-inputChip';
  urlChip.style.display = 'none';
  urlInputWrap.appendChild(urlChip);

  const urlPasteBtn = document.createElement('button');
  urlPasteBtn.type = 'button';
  urlPasteBtn.className = 'jp-CodeLoader-inputBtn';
  urlPasteBtn.title = _l(labels, 'setup.action.paste');
  urlPasteBtn.innerHTML = Svg.paste;
  urlPasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text.trim();
      urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    } catch {
      // Clipboard read denied — silently ignore.
    }
  });
  urlInputWrap.appendChild(urlPasteBtn);

  urlField.appendChild(urlInputWrap);

  const urlHint = document.createElement('div');
  urlHint.className = 'jp-CodeLoader-fieldHint';
  urlHint.textContent = _l(labels, 'setup.field.url.hint');
  urlField.appendChild(urlHint);

  repoCard.appendChild(urlField);

  // Branch field
  const branchField = document.createElement('div');
  branchField.className = 'jp-CodeLoader-field';

  const branchLabelRow = _createLabelRow(
    _l(labels, 'setup.field.branch'),
    null,
    'cl-branch'
  );
  branchField.appendChild(branchLabelRow);

  const branchInputWrap = document.createElement('div');
  branchInputWrap.className = 'jp-CodeLoader-input jp-CodeLoader-input--text';

  const branchPrefix = document.createElement('span');
  branchPrefix.className = 'jp-CodeLoader-inputPrefix';
  branchPrefix.innerHTML = Svg.branch;
  branchInputWrap.appendChild(branchPrefix);

  const branchInput = document.createElement('input');
  branchInput.type = 'text';
  branchInput.id = 'cl-branch';
  branchInput.placeholder = 'main';
  branchInput.value = 'main';
  branchInput.dataset.field = 'branch';
  branchInput.spellcheck = false;
  branchInputWrap.appendChild(branchInput);

  branchField.appendChild(branchInputWrap);

  const branchHint = document.createElement('div');
  branchHint.className = 'jp-CodeLoader-fieldHint';
  branchHint.innerHTML = _l(labels, 'setup.field.branch.hint.rich');
  branchField.appendChild(branchHint);

  repoCard.appendChild(branchField);

  body.appendChild(repoSection);

  // ── Authentication section ──
  const authSection = _createSection(_l(labels, 'setup.section.auth'));
  const authSub = document.createElement('div');
  authSub.className = 'jp-CodeLoader-sectionSub';
  authSub.textContent = _l(labels, 'setup.section.auth.hint');
  authSection.appendChild(authSub);

  const authCard = document.createElement('div');
  authCard.className = 'jp-CodeLoader-card';
  authSection.appendChild(authCard);

  // Segmented control — Public (default) / Token / Login & password
  const seg = document.createElement('div');
  seg.className = 'jp-CodeLoader-seg';
  seg.setAttribute('role', 'tablist');

  const publicSegBtn = document.createElement('button');
  publicSegBtn.type = 'button';
  publicSegBtn.className = 'jp-CodeLoader-segBtn jp-CodeLoader-segBtn--active';
  publicSegBtn.setAttribute('role', 'tab');
  publicSegBtn.innerHTML = `${Svg.globe}<span>${_l(labels, 'setup.auth.public')}</span>`;

  const tokenSegBtn = document.createElement('button');
  tokenSegBtn.type = 'button';
  tokenSegBtn.className = 'jp-CodeLoader-segBtn';
  tokenSegBtn.setAttribute('role', 'tab');
  tokenSegBtn.innerHTML = `${Svg.key}<span>${_l(labels, 'setup.auth.token')}</span>`;

  const basicSegBtn = document.createElement('button');
  basicSegBtn.type = 'button';
  basicSegBtn.className = 'jp-CodeLoader-segBtn';
  basicSegBtn.setAttribute('role', 'tab');
  basicSegBtn.innerHTML = `${Svg.user}<span>${_l(labels, 'setup.auth.basic')}</span>`;

  seg.appendChild(publicSegBtn);
  seg.appendChild(tokenSegBtn);
  seg.appendChild(basicSegBtn);
  authCard.appendChild(seg);

  // Public-mode notice (visible by default)
  const publicNotice = document.createElement('div');
  publicNotice.className = 'jp-CodeLoader-notice';
  publicNotice.innerHTML = `${Svg.info}<div><strong>${_l(labels, 'setup.public.strong')}</strong> ${_l(labels, 'setup.public.desc')}</div>`;
  authCard.appendChild(publicNotice);

  // Token field (hidden by default)
  const tokenField = document.createElement('div');
  tokenField.className = 'jp-CodeLoader-field';
  tokenField.style.display = 'none';

  const tokenLabelRow = _createLabelRow(
    _l(labels, 'setup.field.token'),
    null,
    'cl-token'
  );
  tokenField.appendChild(tokenLabelRow);

  const tokenInputWrap = document.createElement('div');
  tokenInputWrap.className = 'jp-CodeLoader-input';

  const tokenPrefix = document.createElement('span');
  tokenPrefix.className = 'jp-CodeLoader-inputPrefix';
  tokenPrefix.innerHTML = Svg.key;
  tokenInputWrap.appendChild(tokenPrefix);

  const tokenInput = document.createElement('input');
  tokenInput.type = 'password';
  tokenInput.id = 'cl-token';
  tokenInput.placeholder = _l(labels, 'setup.field.token.placeholder');
  tokenInput.dataset.field = 'git_token';
  tokenInput.autocomplete = 'off';
  tokenInput.spellcheck = false;
  tokenInputWrap.appendChild(tokenInput);

  const tokenToggle = document.createElement('button');
  tokenToggle.type = 'button';
  tokenToggle.className = 'jp-CodeLoader-inputBtn';
  tokenToggle.title = _l(labels, 'setup.action.showToken');
  tokenToggle.innerHTML = Svg.eye;
  let tokenVisible = false;
  tokenToggle.addEventListener('click', () => {
    tokenVisible = !tokenVisible;
    tokenInput.type = tokenVisible ? 'text' : 'password';
    tokenToggle.innerHTML = tokenVisible ? Svg.eyeOff : Svg.eye;
    tokenToggle.title = _l(
      labels,
      tokenVisible ? 'setup.action.hideToken' : 'setup.action.showToken'
    );
  });
  tokenInputWrap.appendChild(tokenToggle);

  tokenField.appendChild(tokenInputWrap);

  const tokenHint = document.createElement('div');
  tokenHint.className = 'jp-CodeLoader-fieldHint';
  tokenHint.textContent = _l(labels, 'setup.field.token.hint');
  tokenField.appendChild(tokenHint);

  authCard.appendChild(tokenField);

  // Basic auth fields (hidden by default): username + password
  const basicFields = document.createElement('div');
  basicFields.style.display = 'none';

  const userField = document.createElement('div');
  userField.className = 'jp-CodeLoader-field';

  const userLabelRow = _createLabelRow(
    _l(labels, 'setup.field.username'),
    null,
    'cl-username'
  );
  userField.appendChild(userLabelRow);

  const userInputWrap = document.createElement('div');
  userInputWrap.className = 'jp-CodeLoader-input jp-CodeLoader-input--text';

  const userPrefix = document.createElement('span');
  userPrefix.className = 'jp-CodeLoader-inputPrefix';
  userPrefix.innerHTML = Svg.user;
  userInputWrap.appendChild(userPrefix);

  const userInput = document.createElement('input');
  userInput.type = 'text';
  userInput.id = 'cl-username';
  userInput.placeholder = _l(labels, 'setup.field.username.placeholder');
  userInput.dataset.field = 'git_username';
  userInput.autocomplete = 'off';
  userInput.spellcheck = false;
  userInputWrap.appendChild(userInput);

  userField.appendChild(userInputWrap);
  basicFields.appendChild(userField);

  const passField = document.createElement('div');
  passField.className = 'jp-CodeLoader-field';

  const passLabelRow = _createLabelRow(
    _l(labels, 'setup.field.password'),
    null,
    'cl-password'
  );
  passField.appendChild(passLabelRow);

  const passInputWrap = document.createElement('div');
  passInputWrap.className = 'jp-CodeLoader-input';

  const passPrefix = document.createElement('span');
  passPrefix.className = 'jp-CodeLoader-inputPrefix';
  passPrefix.innerHTML = Svg.lock;
  passInputWrap.appendChild(passPrefix);

  const passInput = document.createElement('input');
  passInput.type = 'password';
  passInput.id = 'cl-password';
  passInput.placeholder = _l(labels, 'setup.field.password.placeholder');
  passInput.dataset.field = 'git_password';
  passInput.autocomplete = 'off';
  passInput.spellcheck = false;
  passInputWrap.appendChild(passInput);

  const passToggle = document.createElement('button');
  passToggle.type = 'button';
  passToggle.className = 'jp-CodeLoader-inputBtn';
  passToggle.title = _l(labels, 'setup.action.showPassword');
  passToggle.innerHTML = Svg.eye;
  let passVisible = false;
  passToggle.addEventListener('click', () => {
    passVisible = !passVisible;
    passInput.type = passVisible ? 'text' : 'password';
    passToggle.innerHTML = passVisible ? Svg.eyeOff : Svg.eye;
    passToggle.title = _l(
      labels,
      passVisible ? 'setup.action.hidePassword' : 'setup.action.showPassword'
    );
  });
  passInputWrap.appendChild(passToggle);

  passField.appendChild(passInputWrap);

  const basicHint = document.createElement('div');
  basicHint.className = 'jp-CodeLoader-fieldHint';
  basicHint.textContent = _l(labels, 'setup.field.basic.hint');
  passField.appendChild(basicHint);

  basicFields.appendChild(passField);
  authCard.appendChild(basicFields);

  // Auth mode switching — default is 'public'
  let authMode: AuthMode = 'public';
  const segBtns: Record<AuthMode, HTMLButtonElement> = {
    public: publicSegBtn,
    token: tokenSegBtn,
    basic: basicSegBtn
  };
  const setAuthMode = (mode: AuthMode) => {
    authMode = mode;
    (Object.keys(segBtns) as AuthMode[]).forEach(k =>
      segBtns[k].classList.toggle('jp-CodeLoader-segBtn--active', k === mode)
    );
    publicNotice.style.display = mode === 'public' ? '' : 'none';
    tokenField.style.display = mode === 'token' ? '' : 'none';
    basicFields.style.display = mode === 'basic' ? '' : 'none';
  };
  publicSegBtn.addEventListener('click', () => setAuthMode('public'));
  tokenSegBtn.addEventListener('click', () => setAuthMode('token'));
  basicSegBtn.addEventListener('click', () => setAuthMode('basic'));

  body.appendChild(authSection);

  // Test strip (lives at end of body, hidden by default)
  const testStrip = document.createElement('div');
  testStrip.className = 'jp-CodeLoader-testStrip';
  testStrip.style.display = 'none';
  body.appendChild(testStrip);

  // ── Bottom toolbar ──
  const bottombar = document.createElement('footer');
  bottombar.className = 'jp-CodeLoader-bottombar';

  const btnRow = document.createElement('div');
  btnRow.className = 'jp-CodeLoader-bottombarRow';

  const testBtn = document.createElement('button');
  testBtn.type = 'button';
  testBtn.className = 'jp-CodeLoader-btn jp-CodeLoader-btn--secondary';
  testBtn.innerHTML = `${Svg.bolt}<span>${_l(labels, 'setup.button.test')}</span>`;
  testBtn.disabled = true;

  const connectBtn = document.createElement('button');
  connectBtn.type = 'button';
  connectBtn.className = 'jp-CodeLoader-btn jp-CodeLoader-btn--primary';
  connectBtn.innerHTML = `<span>${_l(labels, 'setup.button.connect')}</span>${Svg.arrow}`;
  connectBtn.disabled = true;

  btnRow.appendChild(testBtn);
  btnRow.appendChild(connectBtn);
  bottombar.appendChild(btnRow);

  const hint = document.createElement('div');
  hint.className = 'jp-CodeLoader-bottombarHint';
  hint.innerHTML = `${Svg.lock}<span>${_l(labels, 'setup.bottom.hint')}</span>`;
  bottombar.appendChild(hint);

  // ── URL validation: enable/disable buttons + show chip / hint state ──
  const updateUrlState = () => {
    const value = urlInput.value.trim();
    const parsed = parseRepoUrl(value);

    if (!value) {
      urlInputWrap.classList.remove('jp-CodeLoader-input--invalid');
      urlChip.style.display = 'none';
      urlHint.className = 'jp-CodeLoader-fieldHint';
      urlHint.textContent = _l(labels, 'setup.field.url.hint');
    } else if (parsed) {
      urlInputWrap.classList.remove('jp-CodeLoader-input--invalid');
      urlChip.innerHTML = `${providerIcon(parsed.provider)}<span>${providerLabel(parsed.provider)}</span>`;
      urlChip.style.display = '';
      urlHint.className = 'jp-CodeLoader-fieldHint jp-CodeLoader-fieldHint--ok';
      urlHint.innerHTML = `${Svg.check}<span>${parsed.owner}/${parsed.repo} ${_l(labels, 'setup.field.url.on')} ${providerLabel(parsed.provider)}</span>`;
    } else {
      urlInputWrap.classList.add('jp-CodeLoader-input--invalid');
      urlChip.style.display = 'none';
      urlHint.className =
        'jp-CodeLoader-fieldHint jp-CodeLoader-fieldHint--error';
      urlHint.innerHTML = `${Svg.alert}<span>${_l(labels, 'setup.field.url.invalid')}</span>`;
    }

    const canSubmit = !!parsed;
    testBtn.disabled = !canSubmit;
    connectBtn.disabled = !canSubmit;
  };

  urlInput.addEventListener('input', updateUrlState);

  // ── Test connection — verify repo URL parses and branch exists on host ──
  testBtn.addEventListener('click', async () => {
    const parsed = parseRepoUrl(urlInput.value.trim());
    if (!parsed) {
      return;
    }
    const branch = branchInput.value.trim() || 'main';

    const missingToken = authMode === 'token' && !tokenInput.value;
    const missingBasic =
      authMode === 'basic' && (!userInput.value || !passInput.value);
    if (missingToken) {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.needsToken')
      });
      return;
    }
    if (missingBasic) {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.needsBasic')
      });
      return;
    }

    _showTestStrip(testStrip, {
      kind: 'testing',
      message: _l(labels, 'setup.test.resolving', {
        repo: `${parsed.owner}/${parsed.repo}`,
        branch
      })
    });
    testBtn.disabled = true;
    testBtn.innerHTML = `<span class="jp-CodeLoader-spinner jp-CodeLoader-spinner--teal"></span><span>${_l(labels, 'setup.test.testing')}</span>`;

    const result = await _checkBranch(parsed, branch, {
      authMode,
      token: tokenInput.value,
      user: userInput.value,
      pass: passInput.value
    });
    const repoLabel = `${parsed.owner}/${parsed.repo}`;
    const providerName = providerLabel(parsed.provider);

    if (result.kind === 'skipped') {
      _showTestStrip(testStrip, {
        kind: 'ok',
        message: _l(labels, 'setup.test.urlOk', {
          repo: repoLabel,
          provider: providerName
        })
      });
    } else if (result.kind === 'ok') {
      _showTestStrip(testStrip, {
        kind: 'ok',
        message: _l(labels, 'setup.test.branchOk', {
          repo: repoLabel,
          provider: providerName,
          branch
        })
      });
    } else if (result.kind === 'branchNotFound') {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.branchNotFound', {
          branch,
          repo: repoLabel
        })
      });
    } else if (result.kind === 'authRequired') {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.authRequired', { repo: repoLabel })
      });
    } else if (result.kind === 'authFailed') {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.authFailed')
      });
    } else if (result.kind === 'notFound') {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.repoNotFound', { repo: repoLabel })
      });
    } else if (result.kind === 'rateLimited') {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.rateLimited')
      });
    } else {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.test.networkError', {
          error: result.error || 'unknown'
        })
      });
    }
    testBtn.disabled = false;
    testBtn.innerHTML = `${Svg.bolt}<span>${_l(labels, 'setup.button.test')}</span>`;
  });

  // ── Connect ──
  connectBtn.addEventListener('click', async () => {
    const parsed = parseRepoUrl(urlInput.value.trim());
    if (!parsed) {
      return;
    }

    testStrip.style.display = 'none';
    connectBtn.disabled = true;
    testBtn.disabled = true;
    connectBtn.innerHTML = `<span class="jp-CodeLoader-spinner jp-CodeLoader-spinner--white"></span><span>${_l(labels, 'setup.status.cloning')}</span>`;

    const config: Record<string, string> = {
      repo_url: urlInput.value.trim(),
      branch: branchInput.value || 'main'
    };
    if (authMode === 'token' && tokenInput.value) {
      config.git_token = tokenInput.value;
    } else if (authMode === 'basic' && userInput.value && passInput.value) {
      // Backend injects {git_token}@host into HTTPS URLs; URL-encode each
      // half of the credential pair so an @, :, or / in the password is
      // preserved verbatim by git when it parses the resulting URL.
      config.git_token = `${encodeURIComponent(userInput.value)}:${encodeURIComponent(passInput.value)}`;
    }

    try {
      await requestAPI('config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      onConfigSaved();
    } catch (e: any) {
      _showTestStrip(testStrip, {
        kind: 'err',
        message: _l(labels, 'setup.error.connectionFailed', {
          error: e?.message || String(e)
        })
      });
      connectBtn.disabled = false;
      testBtn.disabled = false;
      connectBtn.innerHTML = `<span>${_l(labels, 'setup.button.connect')}</span>${Svg.arrow}`;
    }
  });

  // ── Assemble ──
  container.appendChild(topbar);
  container.appendChild(body);
  container.appendChild(bottombar);

  return container;
}

// ── Helpers ──

function _createSection(title: string): HTMLElement {
  const section = document.createElement('div');
  section.className = 'jp-CodeLoader-section';

  const head = document.createElement('div');
  head.className = 'jp-CodeLoader-sectionHead';

  const titleEl = document.createElement('span');
  titleEl.className = 'jp-CodeLoader-sectionTitle';
  titleEl.textContent = title;

  head.appendChild(titleEl);
  section.appendChild(head);
  return section;
}

function _createLabelRow(
  label: string,
  required: string | null,
  forId: string
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'jp-CodeLoader-fieldLabelRow';

  const labelEl = document.createElement('label');
  labelEl.className = 'jp-CodeLoader-fieldLabel';
  labelEl.htmlFor = forId;
  labelEl.textContent = label;
  row.appendChild(labelEl);

  if (required) {
    const badge = document.createElement('span');
    badge.className = 'jp-CodeLoader-fieldReq';
    badge.textContent = required;
    row.appendChild(badge);
  }
  return row;
}

function _showTestStrip(
  strip: HTMLElement,
  opts: { kind: 'testing' | 'ok' | 'err'; message: string }
): void {
  strip.className = `jp-CodeLoader-testStrip jp-CodeLoader-testStrip--${opts.kind}`;
  strip.style.display = '';
  const lead =
    opts.kind === 'testing'
      ? '<span class="jp-CodeLoader-spinner"></span>'
      : opts.kind === 'ok'
        ? Svg.check
        : Svg.alert;
  strip.innerHTML = `${lead}<span>${opts.message}</span>`;
}

type BranchCheckResult =
  | { kind: 'ok' }
  | { kind: 'skipped' }
  | { kind: 'branchNotFound' }
  | { kind: 'authRequired' }
  | { kind: 'authFailed' }
  | { kind: 'notFound' }
  | { kind: 'rateLimited' }
  | { kind: 'networkError'; error: string };

/**
 * Probe the host's public REST API to verify the branch exists.
 * GitHub and GitLab both serve CORS-enabled JSON endpoints for this.
 * Other hosts return 'skipped' so the user still gets URL-parse feedback.
 */
async function _checkBranch(
  parsed: IParsedRepo,
  branch: string,
  creds: {
    authMode: 'public' | 'token' | 'basic';
    token: string;
    user: string;
    pass: string;
  }
): Promise<BranchCheckResult> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (parsed.provider === 'github') {
    if (creds.authMode === 'token' && creds.token) {
      headers.Authorization = `Bearer ${creds.token}`;
    } else if (creds.authMode === 'basic' && creds.user && creds.pass) {
      headers.Authorization = `Basic ${btoa(`${creds.user}:${creds.pass}`)}`;
    }
    const url = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/branches/${encodeURIComponent(branch)}`;
    return _fetchBranch(url, headers);
  }

  if (parsed.provider === 'gitlab') {
    if (creds.authMode === 'token' && creds.token) {
      headers['PRIVATE-TOKEN'] = creds.token;
    } else if (creds.authMode === 'basic' && creds.user && creds.pass) {
      headers.Authorization = `Basic ${btoa(`${creds.user}:${creds.pass}`)}`;
    }
    const projectPath = encodeURIComponent(`${parsed.owner}/${parsed.repo}`);
    const url = `https://gitlab.com/api/v4/projects/${projectPath}/repository/branches/${encodeURIComponent(branch)}`;
    return _fetchBranch(url, headers);
  }

  // Unknown host: skip — we cannot probe without per-host knowledge.
  return { kind: 'skipped' };
}

async function _fetchBranch(
  url: string,
  headers: Record<string, string>
): Promise<BranchCheckResult> {
  let r: Response;
  try {
    r = await fetch(url, { headers });
  } catch (e: any) {
    return { kind: 'networkError', error: e?.message || String(e) };
  }
  if (r.ok) {
    return { kind: 'ok' };
  }
  if (r.status === 401) {
    return { kind: headers.Authorization ? 'authFailed' : 'authRequired' };
  }
  if (r.status === 403) {
    return { kind: 'rateLimited' };
  }
  if (r.status === 404) {
    // We can't tell from status alone whether the repo or the branch is
    // missing. Probe the repo root: if that 404s too, the repo is gone.
    const repoRootMatch = url.match(/^(.*\/repos\/[^/]+\/[^/]+)/);
    const projectMatch = url.match(/^(.*\/projects\/[^/]+)/);
    const probe = repoRootMatch?.[1] || projectMatch?.[1];
    if (probe) {
      try {
        const r2 = await fetch(probe, { headers });
        if (r2.status === 404) {
          return { kind: 'notFound' };
        }
        if (r2.status === 401) {
          return {
            kind: headers.Authorization ? 'authFailed' : 'authRequired'
          };
        }
      } catch {
        // fall through to branchNotFound
      }
    }
    return { kind: 'branchNotFound' };
  }
  return { kind: 'networkError', error: `HTTP ${r.status}` };
}
