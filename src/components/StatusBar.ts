/**
 * Status bar (footer) component with sync info and refresh button.
 */

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
  }
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-status';

  // Sync info
  const syncLine = document.createElement('div');
  syncLine.className = 'jp-CodeLoader-status-sync';

  if (lastSync) {
    const elapsed = _timeAgo(lastSync);
    syncLine.textContent = labels.lastSync.replace('{time}', elapsed);
  }

  // Filter counts
  const countLine = document.createElement('div');
  countLine.className = 'jp-CodeLoader-status-counts';

  const shownText = labels.shown.replace('{n}', String(shownCount));
  if (hiddenCount > 0 && activeCodeLang) {
    const hiddenText = labels.hidden
      .replace('{n}', String(hiddenCount))
      .replace('{lang}', activeCodeLang);
    countLine.textContent = `${shownText} \u00B7 ${hiddenText}`;
  } else {
    countLine.textContent = `${shownText} \u00B7 ${labels.noFilter}`;
  }

  // Refresh button
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'jp-CodeLoader-status-refreshBtn';
  refreshBtn.textContent = labels.refresh;
  refreshBtn.addEventListener('click', () => {
    onRefresh();
  });

  container.appendChild(syncLine);
  container.appendChild(countLine);
  container.appendChild(refreshBtn);

  return container;
}

/**
 * Update the status bar content in-place.
 */
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
  const syncLine = container.querySelector('.jp-CodeLoader-status-sync');
  if (syncLine && lastSync) {
    const elapsed = _timeAgo(lastSync);
    syncLine.textContent = labels.lastSync.replace('{time}', elapsed);
  }

  const countLine = container.querySelector('.jp-CodeLoader-status-counts');
  if (countLine) {
    const shownText = labels.shown.replace('{n}', String(shownCount));
    if (hiddenCount > 0 && activeCodeLang) {
      const hiddenText = labels.hidden
        .replace('{n}', String(hiddenCount))
        .replace('{lang}', activeCodeLang);
      countLine.textContent = `${shownText} \u00B7 ${hiddenText}`;
    } else {
      countLine.textContent = `${shownText} \u00B7 ${labels.noFilter}`;
    }
  }
}

function _timeAgo(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return 'just now';
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
