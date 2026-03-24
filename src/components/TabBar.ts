/**
 * Tab bar component: "Code examples" / "Snippets"
 */

export type TabType = 'code' | 'snippets';

export function createTabBar(
  onTabChange: (tab: TabType) => void,
  labels: { code: string; snippets: string }
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-tabs';

  const codeTab = document.createElement('button');
  codeTab.className = 'jp-CodeLoader-tab jp-CodeLoader-tab--active';
  codeTab.textContent = labels.code;
  codeTab.dataset.tab = 'code';

  const snippetsTab = document.createElement('button');
  snippetsTab.className = 'jp-CodeLoader-tab';
  snippetsTab.textContent = labels.snippets;
  snippetsTab.dataset.tab = 'snippets';

  const setActive = (tab: TabType) => {
    codeTab.classList.toggle('jp-CodeLoader-tab--active', tab === 'code');
    snippetsTab.classList.toggle(
      'jp-CodeLoader-tab--active',
      tab === 'snippets'
    );
    onTabChange(tab);
  };

  codeTab.addEventListener('click', () => setActive('code'));
  snippetsTab.addEventListener('click', () => setActive('snippets'));

  container.appendChild(codeTab);
  container.appendChild(snippetsTab);

  return container;
}
