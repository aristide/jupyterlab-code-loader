/**
 * Subheader chip + status row — shows the active kernel filter and notebook.
 */

import { codeLangLabel, codeLangClass } from '../kernel_map';

export function createKernelIndicator(
  codeLang: string | null,
  kernelName: string | null,
  labels: { detected: string; none: string }
): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'jp-CodeLoader-subheaderFilter';

  const chip = document.createElement('span');
  chip.className = `jp-CodeLoader-chip jp-CodeLoader-chip--${codeLangClass(codeLang)}`;
  chip.textContent = codeLangLabel(codeLang);
  if (!codeLang) {
    chip.classList.add('jp-CodeLoader-chip--active');
  }
  wrap.appendChild(chip);

  const status = document.createElement('span');
  status.className = 'jp-CodeLoader-subheaderStatus';
  if (kernelName) {
    status.classList.add('jp-CodeLoader-subheaderStatus--live');
  }

  const dot = document.createElement('span');
  dot.className = 'jp-CodeLoader-statusDot';
  status.appendChild(dot);

  const text = document.createElement('span');
  if (kernelName) {
    text.textContent = labels.detected.replace('{name}', kernelName);
  } else {
    text.textContent = labels.none;
  }
  status.appendChild(text);

  wrap.appendChild(status);
  return wrap;
}

export function updateKernelIndicator(
  container: HTMLElement,
  codeLang: string | null,
  kernelName: string | null,
  labels: { detected: string; none: string }
): void {
  const chip = container.querySelector('.jp-CodeLoader-chip') as HTMLElement;
  if (chip) {
    chip.className = `jp-CodeLoader-chip jp-CodeLoader-chip--${codeLangClass(codeLang)}`;
    chip.textContent = codeLangLabel(codeLang);
    if (!codeLang) {
      chip.classList.add('jp-CodeLoader-chip--active');
    }
  }
  const status = container.querySelector(
    '.jp-CodeLoader-subheaderStatus'
  ) as HTMLElement;
  if (status) {
    status.classList.toggle(
      'jp-CodeLoader-subheaderStatus--live',
      !!kernelName
    );
    const text = status.querySelector('span:nth-child(2)');
    if (text) {
      text.textContent = kernelName
        ? labels.detected.replace('{name}', kernelName)
        : labels.none;
    }
  }
}
