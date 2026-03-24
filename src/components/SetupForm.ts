/**
 * Setup form component shown when no repository URL is configured.
 * Collects repo URL, branch, token, and locale from the user.
 */

import { requestAPI } from '../handler';

export function createSetupForm(onConfigSaved: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-setupForm';

  // Title
  const title = document.createElement('h3');
  title.className = 'jp-CodeLoader-setupForm-title';
  title.textContent = 'Configure Code Loader';

  // Description
  const desc = document.createElement('p');
  desc.className = 'jp-CodeLoader-setupForm-desc';
  desc.textContent =
    'Enter the Git repository URL containing your code examples and snippets.';

  // Form fields
  const form = document.createElement('div');
  form.className = 'jp-CodeLoader-setupForm-fields';

  // Repo URL (required)
  const urlGroup = _createField(
    'Repository URL',
    'text',
    'https://github.com/org/examples-registry.git',
    'repo_url',
    true
  );

  // Branch
  const branchGroup = _createField('Branch', 'text', 'main', 'branch', false);
  const branchInput = branchGroup.querySelector('input') as HTMLInputElement;
  branchInput.value = 'main';

  // Git token (optional)
  const tokenGroup = _createField(
    'Git Token (optional)',
    'password',
    'Token for private repos',
    'git_token',
    false
  );

  // Default locale
  const localeGroup = document.createElement('div');
  localeGroup.className = 'jp-CodeLoader-setupForm-group';

  const localeLabel = document.createElement('label');
  localeLabel.className = 'jp-CodeLoader-setupForm-label';
  localeLabel.textContent = 'Default Locale';

  const localeSelect = document.createElement('select');
  localeSelect.className = 'jp-CodeLoader-setupForm-input';
  localeSelect.dataset.field = 'default_locale';

  for (const loc of ['en', 'fr', 'es', 'pt', 'ar', 'zh', 'ru']) {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    localeSelect.appendChild(opt);
  }

  localeGroup.appendChild(localeLabel);
  localeGroup.appendChild(localeSelect);

  form.appendChild(urlGroup);
  form.appendChild(branchGroup);
  form.appendChild(tokenGroup);
  form.appendChild(localeGroup);

  // Error message area
  const errorMsg = document.createElement('div');
  errorMsg.className = 'jp-CodeLoader-setupForm-error';
  errorMsg.style.display = 'none';

  // Status/progress area
  const statusMsg = document.createElement('div');
  statusMsg.className = 'jp-CodeLoader-setupForm-status';
  statusMsg.style.display = 'none';

  // Connect button
  const connectBtn = document.createElement('button');
  connectBtn.className =
    'jp-CodeLoader-setupForm-connectBtn jp-mod-styled jp-mod-accept';
  connectBtn.textContent = 'Connect';

  connectBtn.addEventListener('click', async () => {
    const urlInput = container.querySelector(
      '[data-field="repo_url"]'
    ) as HTMLInputElement;
    const repoUrl = urlInput?.value?.trim();

    if (!repoUrl) {
      errorMsg.textContent = 'Repository URL is required.';
      errorMsg.style.display = 'block';
      return;
    }

    errorMsg.style.display = 'none';
    statusMsg.textContent = 'Connecting and cloning repository...';
    statusMsg.style.display = 'block';
    connectBtn.disabled = true;

    const config: Record<string, string> = {
      repo_url: repoUrl,
      branch: branchInput.value || 'main',
      default_locale: localeSelect.value || 'en'
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
      statusMsg.textContent = 'Connected! Loading content...';
      onConfigSaved();
    } catch (e: any) {
      errorMsg.textContent = `Connection failed: ${e.message || e}`;
      errorMsg.style.display = 'block';
      statusMsg.style.display = 'none';
      connectBtn.disabled = false;
    }
  });

  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(form);
  container.appendChild(errorMsg);
  container.appendChild(statusMsg);
  container.appendChild(connectBtn);

  return container;
}

function _createField(
  label: string,
  type: string,
  placeholder: string,
  fieldName: string,
  required: boolean
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'jp-CodeLoader-setupForm-group';

  const labelEl = document.createElement('label');
  labelEl.className = 'jp-CodeLoader-setupForm-label';
  labelEl.textContent = label;
  if (required) {
    const star = document.createElement('span');
    star.className = 'jp-CodeLoader-setupForm-required';
    star.textContent = ' *';
    labelEl.appendChild(star);
  }

  const input = document.createElement('input');
  input.type = type;
  input.className = 'jp-CodeLoader-setupForm-input';
  input.placeholder = placeholder;
  input.dataset.field = fieldName;
  if (required) {
    input.required = true;
  }

  group.appendChild(labelEl);
  group.appendChild(input);

  return group;
}
