/**
 * Snippet row component for the Snippets tab.
 */

import { ISnippet } from '../model';

type Labels = Record<string, string>;

export function createSnippetRow(
  snippet: ISnippet,
  onInsert: (snippet: ISnippet) => void,
  onCopy: (snippet: ISnippet) => void,
  onTerminalCopy: (snippet: ISnippet) => void,
  labels: Labels
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'jp-CodeLoader-snippet';

  // Title line with action buttons
  const titleLine = document.createElement('div');
  titleLine.className = 'jp-CodeLoader-snippet-header';

  const titleText = document.createElement('span');
  titleText.className = 'jp-CodeLoader-snippet-title';
  titleText.textContent = snippet.title;

  const actions = document.createElement('div');
  actions.className = 'jp-CodeLoader-snippet-actions';

  // Insert button
  const insertBtn = document.createElement('button');
  insertBtn.className = 'jp-CodeLoader-snippet-actionBtn';
  insertBtn.textContent = '\u2B9E';
  insertBtn.title = labels['snippet.button.insert'] || 'Insert into notebook';
  insertBtn.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    onInsert(snippet);
  });
  actions.appendChild(insertBtn);

  // Terminal button (bash only)
  if (snippet.code_lang === 'bash') {
    const termBtn = document.createElement('button');
    termBtn.className = 'jp-CodeLoader-snippet-actionBtn';
    termBtn.textContent = '>_';
    termBtn.title = labels['snippet.button.terminal'] || 'Send to terminal';
    termBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      onTerminalCopy(snippet);
    });
    actions.appendChild(termBtn);
  }

  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'jp-CodeLoader-snippet-actionBtn';
  copyBtn.textContent = '\uD83D\uDCCB';
  copyBtn.title = labels['snippet.button.copy'] || 'Copy to clipboard';
  copyBtn.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    onCopy(snippet);
  });
  actions.appendChild(copyBtn);

  titleLine.appendChild(titleText);
  titleLine.appendChild(actions);

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

  for (const tag of snippet.tags) {
    const tagBadge = document.createElement('span');
    tagBadge.className = 'jp-CodeLoader-badge jp-CodeLoader-badge--tag';
    tagBadge.textContent = tag;
    badgeLine.appendChild(tagBadge);
  }

  row.appendChild(titleLine);
  row.appendChild(preview);
  row.appendChild(badgeLine);

  row.title = snippet.code;

  return row;
}
