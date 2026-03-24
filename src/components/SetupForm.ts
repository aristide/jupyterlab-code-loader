/**
 * Setup form component shown when no repository URL is configured.
 * Collects repo URL, branch, and token from the user.
 * Content language is auto-detected from JupyterLab settings.
 */

import { requestAPI } from '../handler';

export function createSetupForm(onConfigSaved: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-setupForm';

  // ── Hero section ──
  const hero = document.createElement('div');
  hero.className = 'jp-CodeLoader-setup-hero';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'jp-CodeLoader-setup-iconWrap';
  iconWrap.innerHTML =
    '<svg viewBox="0 0 24 24" width="28" height="28">' +
    '<path fill="currentColor" d="M9.1,24 L11.5,17.4 L11.9,16.5 L12.5,16' +
    ' L13,15.8 L16.5,15.7 L17.2,15.3 L17.3,14.9 L17.3,8.5 L17.3,8.3' +
    ' L14.6,8.3 L13.9,8 L13.4,7.2 L13.4,4.7 L7.3,4.7 L6.8,5 L6.7,19' +
    ' L7,19.4 L7.5,19.6 L9.9,19.6 L9.5,20.7 L6.8,20.6 L6,20 L5.7,19.2' +
    ' L5.7,4.9 L6.4,4 L7.1,3.6 L11.4,3.6 L12.4,1.2 L13,0.4 L13.8,0' +
    ' L15.3,0 L14,3.5 L18,7.5 L18.3,8 L18.3,15.4 L18.1,15.9 L17.6,16.6' +
    ' L14.2,19.7Z"/></svg>';

  const heroTitle = document.createElement('h3');
  heroTitle.className = 'jp-CodeLoader-setup-heroTitle';
  heroTitle.textContent = 'Connect a repository';

  const heroDesc = document.createElement('p');
  heroDesc.className = 'jp-CodeLoader-setup-heroDesc';
  heroDesc.textContent =
    'Link a Git repository to browse code examples and reusable snippets.';

  hero.appendChild(iconWrap);
  hero.appendChild(heroTitle);
  hero.appendChild(heroDesc);

  // ── Form card ──
  const card = document.createElement('div');
  card.className = 'jp-CodeLoader-setup-card';

  // Section: Repository
  const repoSection = _createSection('Repository');

  const urlGroup = _createField(
    'URL',
    'text',
    'https://github.com/org/examples.git',
    'repo_url',
    true,
    'HTTPS or SSH clone URL'
  );

  const branchGroup = _createField(
    'Branch',
    'text',
    'main',
    'branch',
    false,
    'Target branch to track'
  );
  const branchInput = branchGroup.querySelector('input') as HTMLInputElement;
  branchInput.value = 'main';

  repoSection.appendChild(urlGroup);
  repoSection.appendChild(branchGroup);

  // Section: Authentication
  const authSection = _createSection('Authentication');
  const authHint = document.createElement('p');
  authHint.className = 'jp-CodeLoader-setup-sectionHint';
  authHint.textContent = 'Only required for private repositories.';
  authSection.appendChild(authHint);

  const tokenGroup = _createField(
    'Access token',
    'password',
    'ghp_\u2026 or glpat-\u2026',
    'git_token',
    false,
    'GitHub PAT or GitLab token'
  );
  authSection.appendChild(tokenGroup);

  card.appendChild(repoSection);
  card.appendChild(authSection);

  // ── Feedback area ──
  const feedback = document.createElement('div');
  feedback.className = 'jp-CodeLoader-setup-feedback';

  const errorMsg = document.createElement('div');
  errorMsg.className = 'jp-CodeLoader-setup-error';
  errorMsg.setAttribute('role', 'alert');

  const errorIcon = document.createElement('span');
  errorIcon.className = 'jp-CodeLoader-setup-errorIcon';
  errorIcon.textContent = '\u26A0';
  const errorText = document.createElement('span');
  errorText.className = 'jp-CodeLoader-setup-errorText';
  errorMsg.appendChild(errorIcon);
  errorMsg.appendChild(errorText);

  const statusMsg = document.createElement('div');
  statusMsg.className = 'jp-CodeLoader-setup-status';

  const spinner = document.createElement('span');
  spinner.className = 'jp-CodeLoader-setup-spinner';
  const statusText = document.createElement('span');
  statusText.className = 'jp-CodeLoader-setup-statusText';
  statusMsg.appendChild(spinner);
  statusMsg.appendChild(statusText);

  feedback.appendChild(errorMsg);
  feedback.appendChild(statusMsg);

  // ── Connect button ──
  const btnWrap = document.createElement('div');
  btnWrap.className = 'jp-CodeLoader-setup-actions';

  const connectBtn = document.createElement('button');
  connectBtn.className = 'jp-CodeLoader-setup-connectBtn';
  connectBtn.type = 'button';

  const btnLabel = document.createElement('span');
  btnLabel.textContent = 'Connect repository';
  connectBtn.appendChild(btnLabel);

  btnWrap.appendChild(connectBtn);

  // ── Click handler ──
  connectBtn.addEventListener('click', async () => {
    const urlInput = container.querySelector(
      '[data-field="repo_url"]'
    ) as HTMLInputElement;
    const repoUrl = urlInput?.value?.trim();

    if (!repoUrl) {
      _showError(errorMsg, errorText, 'Repository URL is required.');
      urlInput?.focus();
      urlInput?.parentElement?.classList.add(
        'jp-CodeLoader-setup-group--invalid'
      );
      return;
    }

    urlInput?.parentElement?.classList.remove(
      'jp-CodeLoader-setup-group--invalid'
    );
    _hideError(errorMsg);
    _showStatus(statusMsg, statusText, 'Cloning repository\u2026');
    connectBtn.disabled = true;
    connectBtn.classList.add('jp-CodeLoader-setup-connectBtn--loading');

    const config: Record<string, string> = {
      repo_url: repoUrl,
      branch: branchInput.value || 'main'
    };

    const tokenInput = container.querySelector(
      '[data-field="git_token"]'
    ) as HTMLInputElement;
    if (tokenInput?.value) {
      config.git_token = tokenInput.value;
    }

    try {
      await requestAPI('config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      _showStatus(
        statusMsg,
        statusText,
        'Connected \u2014 loading content\u2026'
      );
      onConfigSaved();
    } catch (e: any) {
      _showError(errorMsg, errorText, `Connection failed: ${e.message || e}`);
      _hideStatus(statusMsg);
      connectBtn.disabled = false;
      connectBtn.classList.remove('jp-CodeLoader-setup-connectBtn--loading');
    }
  });

  // ── Assemble ──
  container.appendChild(hero);
  container.appendChild(card);
  container.appendChild(feedback);
  container.appendChild(btnWrap);

  return container;
}

/* ── Internal helpers ── */

function _createSection(title: string): HTMLElement {
  const section = document.createElement('div');
  section.className = 'jp-CodeLoader-setup-section';

  const heading = document.createElement('div');
  heading.className = 'jp-CodeLoader-setup-sectionTitle';
  heading.textContent = title;

  section.appendChild(heading);
  return section;
}

function _createField(
  label: string,
  type: string,
  placeholder: string,
  fieldName: string,
  required: boolean,
  hint?: string
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'jp-CodeLoader-setup-group';

  const labelRow = document.createElement('div');
  labelRow.className = 'jp-CodeLoader-setup-labelRow';

  const labelEl = document.createElement('label');
  labelEl.className = 'jp-CodeLoader-setup-label';
  labelEl.textContent = label;

  if (required) {
    const badge = document.createElement('span');
    badge.className = 'jp-CodeLoader-setup-requiredBadge';
    badge.textContent = 'required';
    labelRow.appendChild(labelEl);
    labelRow.appendChild(badge);
  } else {
    labelRow.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.type = type;
  input.className = 'jp-CodeLoader-setup-input';
  input.placeholder = placeholder;
  input.dataset.field = fieldName;
  input.autocomplete = 'off';
  input.spellcheck = false;
  if (required) {
    input.required = true;
  }

  // Clear invalid state on input
  input.addEventListener('input', () => {
    group.classList.remove('jp-CodeLoader-setup-group--invalid');
  });

  group.appendChild(labelRow);
  group.appendChild(input);

  if (hint) {
    const hintEl = document.createElement('span');
    hintEl.className = 'jp-CodeLoader-setup-hint';
    hintEl.textContent = hint;
    group.appendChild(hintEl);
  }

  return group;
}

function _showError(
  container: HTMLElement,
  textEl: HTMLElement,
  msg: string
): void {
  textEl.textContent = msg;
  container.classList.add('jp-CodeLoader-setup-error--visible');
}

function _hideError(container: HTMLElement): void {
  container.classList.remove('jp-CodeLoader-setup-error--visible');
}

function _showStatus(
  container: HTMLElement,
  textEl: HTMLElement,
  msg: string
): void {
  textEl.textContent = msg;
  container.classList.add('jp-CodeLoader-setup-status--visible');
}

function _hideStatus(container: HTMLElement): void {
  container.classList.remove('jp-CodeLoader-setup-status--visible');
}
