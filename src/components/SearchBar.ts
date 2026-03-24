/**
 * Debounced search bar component.
 */

export function createSearchBar(
  onSearch: (query: string) => void,
  placeholder: string
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-search';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'jp-CodeLoader-searchInput';
  input.placeholder = placeholder;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  input.addEventListener('input', () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      onSearch(input.value);
    }, 200);
  });

  // Allow clearing with Escape
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      input.value = '';
      onSearch('');
    }
  });

  container.appendChild(input);
  return container;
}

/**
 * Update the search bar placeholder text.
 */
export function updateSearchPlaceholder(
  searchBar: HTMLElement,
  placeholder: string
): void {
  const input = searchBar.querySelector('input');
  if (input) {
    input.placeholder = placeholder;
  }
}
