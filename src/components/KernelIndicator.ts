/**
 * Kernel indicator pill component: Python (blue), R (green), All (gray).
 */

import { codeLangLabel, codeLangClass } from '../kernel_map';

export function createKernelIndicator(
  codeLang: string | null,
  kernelName: string | null,
  labels: { detected: string; none: string }
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-kernelStatus';

  // Pill badge
  const pill = document.createElement('span');
  pill.className = `jp-CodeLoader-kernelPill jp-CodeLoader-kernelPill--${codeLangClass(codeLang)}`;
  pill.textContent = codeLangLabel(codeLang);

  // Status text
  const statusText = document.createElement('span');
  statusText.className = 'jp-CodeLoader-kernelText';
  if (kernelName) {
    statusText.textContent = labels.detected.replace('{name}', kernelName);
  } else {
    statusText.textContent = labels.none;
  }

  container.appendChild(pill);
  container.appendChild(statusText);

  return container;
}

/**
 * Update an existing kernel indicator in-place.
 */
export function updateKernelIndicator(
  container: HTMLElement,
  codeLang: string | null,
  kernelName: string | null,
  labels: { detected: string; none: string }
): void {
  const pill = container.querySelector('.jp-CodeLoader-kernelPill');
  if (pill) {
    pill.className = `jp-CodeLoader-kernelPill jp-CodeLoader-kernelPill--${codeLangClass(codeLang)}`;
    pill.textContent = codeLangLabel(codeLang);
  }

  const text = container.querySelector('.jp-CodeLoader-kernelText');
  if (text) {
    if (kernelName) {
      text.textContent = labels.detected.replace('{name}', kernelName);
    } else {
      text.textContent = labels.none;
    }
  }
}
