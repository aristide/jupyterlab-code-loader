/**
 * Debounced search bar with a prefix search icon.
 */

import { Svg } from '../svg_icons';

export function createSearchBar(
  onSearch: (query: string) => void,
  placeholder: string
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'jp-CodeLoader-search';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'jp-CodeLoader-input jp-CodeLoader-input--text';

  const prefix = document.createElement('span');
  prefix.className = 'jp-CodeLoader-inputPrefix';
  prefix.innerHTML = Svg.search;
  inputWrap.appendChild(prefix);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.spellcheck = false;
  inputWrap.appendChild(input);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  input.addEventListener('input', () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => onSearch(input.value), 200);
  });
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      input.value = '';
      onSearch('');
    }
  });

  container.appendChild(inputWrap);
  return container;
}

export function updateSearchPlaceholder(
  searchBar: HTMLElement,
  placeholder: string
): void {
  const input = searchBar.querySelector('input');
  if (input) {
    input.placeholder = placeholder;
  }
}
