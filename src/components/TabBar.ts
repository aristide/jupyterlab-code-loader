/**
 * Tab bar — "Code examples" / "Snippets" with counts.
 * Counts can be updated after data loads via updateTabCount().
 */

export type TabType = 'code' | 'snippets';

export function createTabBar(
  onTabChange: (tab: TabType) => void,
  labels: { code: string; snippets: string }
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-tabs';
  container.setAttribute('role', 'tablist');

  const codeTab = _makeTab('code', labels.code, true);
  const snippetsTab = _makeTab('snippets', labels.snippets, false);

  const setActive = (tab: TabType) => {
    codeTab.classList.toggle('jp-CodeLoader-tab--active', tab === 'code');
    codeTab.setAttribute('aria-selected', String(tab === 'code'));
    snippetsTab.classList.toggle(
      'jp-CodeLoader-tab--active',
      tab === 'snippets'
    );
    snippetsTab.setAttribute('aria-selected', String(tab === 'snippets'));
    onTabChange(tab);
  };

  codeTab.addEventListener('click', () => setActive('code'));
  snippetsTab.addEventListener('click', () => setActive('snippets'));

  container.appendChild(codeTab);
  container.appendChild(snippetsTab);

  return container;
}

export function updateTabCount(
  tabBar: HTMLElement,
  tab: TabType,
  count: number
): void {
  const btn = tabBar.querySelector(`[data-tab="${tab}"]`);
  if (!btn) {
    return;
  }
  const badge = btn.querySelector('.jp-CodeLoader-tabCount');
  if (badge) {
    badge.textContent = String(count);
  }
}

function _makeTab(
  type: TabType,
  label: string,
  active: boolean
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className =
    'jp-CodeLoader-tab' + (active ? ' jp-CodeLoader-tab--active' : '');
  btn.dataset.tab = type;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', String(active));

  const text = document.createElement('span');
  text.textContent = label;
  btn.appendChild(text);

  const count = document.createElement('span');
  count.className = 'jp-CodeLoader-tabCount';
  count.textContent = '0';
  btn.appendChild(count);

  return btn;
}
