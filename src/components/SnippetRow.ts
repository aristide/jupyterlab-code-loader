/**
 * Snippet row component for the Snippets tab.
 */

import { ISnippet } from '../model';

export function createSnippetRow(
  snippet: ISnippet,
  onInsert: (snippet: ISnippet) => void,
  onCopy: (snippet: ISnippet) => void
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'jp-CodeLoader-snippet';

  // Title line with copy button
  const titleLine = document.createElement('div');
  titleLine.className = 'jp-CodeLoader-snippet-header';

  const titleText = document.createElement('span');
  titleText.className = 'jp-CodeLoader-snippet-title';
  titleText.textContent = snippet.title;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'jp-CodeLoader-snippet-copyBtn';
  copyBtn.textContent = '\uD83D\uDCCB'; // clipboard emoji
  copyBtn.title = 'Copy to clipboard';
  copyBtn.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    onCopy(snippet);
  });

  titleLine.appendChild(titleText);
  titleLine.appendChild(copyBtn);

  // Code preview
  const preview = document.createElement('div');
  preview.className = 'jp-CodeLoader-snippet-preview';
  const codeLine = snippet.code.split('\n')[0];
  preview.textContent =
    codeLine.length > 50 ? codeLine.substring(0, 50) + '\u2026' : codeLine;

  // Badges line
  const badgeLine = document.createElement('div');
  badgeLine.className = 'jp-CodeLoader-snippet-badges';

  const codeBadge = document.createElement('span');
  codeBadge.className = 'jp-CodeLoader-badge jp-CodeLoader-badge--code';
  codeBadge.textContent = snippet.code_lang;
  badgeLine.appendChild(codeBadge);

  // Topic tags
  for (const tag of snippet.tags) {
    const tagBadge = document.createElement('span');
    tagBadge.className = 'jp-CodeLoader-badge jp-CodeLoader-badge--tag';
    tagBadge.textContent = tag;
    badgeLine.appendChild(tagBadge);
  }

  row.appendChild(titleLine);
  row.appendChild(preview);
  row.appendChild(badgeLine);

  // Click to insert into active cell
  row.addEventListener('click', () => {
    onInsert(snippet);
  });

  // Full code tooltip on hover
  row.title = snippet.code;

  return row;
}
