/**
 * Sync bar — sits at the bottom of the connected sidebar.
 * Shows last-sync time, visible/hidden counts, and a refresh action.
 */

import { Svg } from '../svg_icons';

export function createStatusBar(
  lastSync: string | null,
  shownCount: number,
  hiddenCount: number,
  activeCodeLang: string | null,
  onRefresh: () => void,
  labels: {
    lastSync: string;
    refresh: string;
    shown: string;
    hidden: string;
    noFilter: string;
    justNow?: string;
  }
): HTMLElement {
  const bar = document.createElement('footer');
  bar.className = 'jp-CodeLoader-syncbar';

  // Sync line
  const sync = document.createElement('span');
  sync.className = 'jp-CodeLoader-syncbarSync';

  const dot = document.createElement('span');
  dot.className = 'jp-CodeLoader-syncDot';
  sync.appendChild(dot);

  const syncText = document.createElement('span');
  if (lastSync) {
    const elapsed = _timeAgo(lastSync, labels.justNow);
    const html = labels.lastSync.replace(
      '{time}',
      `<strong>${elapsed}</strong>`
    );
    syncText.innerHTML = html;
  } else {
    syncText.textContent = '';
  }
  sync.appendChild(syncText);
  bar.appendChild(sync);

  // Count line
  const count = document.createElement('span');
  count.className = 'jp-CodeLoader-syncbarCount';
  const shownText = labels.shown.replace('{n}', String(shownCount));
  if (hiddenCount > 0 && activeCodeLang) {
    const hiddenText = labels.hidden
      .replace('{n}', String(hiddenCount))
      .replace('{lang}', activeCodeLang);
    count.textContent = `${shownText} · ${hiddenText}`;
  } else {
    count.textContent = `${shownText} · ${labels.noFilter}`;
  }
  bar.appendChild(count);

  // Refresh button
  const refresh = document.createElement('button');
  refresh.type = 'button';
  refresh.className = 'jp-CodeLoader-syncbarRefresh';
  refresh.innerHTML = `${Svg.refresh}<span>${labels.refresh}</span>`;
  refresh.addEventListener('click', () => {
    onRefresh();
  });
  bar.appendChild(refresh);

  return bar;
}

export function updateStatusBar(
  container: HTMLElement,
  lastSync: string | null,
  shownCount: number,
  hiddenCount: number,
  activeCodeLang: string | null,
  labels: {
    lastSync: string;
    shown: string;
    hidden: string;
    noFilter: string;
  }
): void {
  const sync = container.querySelector(
    '.jp-CodeLoader-syncbarSync > span:nth-child(2)'
  );
  if (sync && lastSync) {
    const html = labels.lastSync.replace(
      '{time}',
      `<strong>${_timeAgo(lastSync)}</strong>`
    );
    sync.innerHTML = html;
  }
  const count = container.querySelector('.jp-CodeLoader-syncbarCount');
  if (count) {
    const shownText = labels.shown.replace('{n}', String(shownCount));
    if (hiddenCount > 0 && activeCodeLang) {
      const hiddenText = labels.hidden
        .replace('{n}', String(hiddenCount))
        .replace('{lang}', activeCodeLang);
      count.textContent = `${shownText} · ${hiddenText}`;
    } else {
      count.textContent = `${shownText} · ${labels.noFilter}`;
    }
  }
}

function _timeAgo(isoString: string, justNowLabel?: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) {
    return justNowLabel || 'just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}
