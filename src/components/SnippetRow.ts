/**
 * Snippet card — title + action buttons, code preview line, tag row.
 */

import { ISnippet } from '../model';
import { Svg } from '../svg_icons';

type Labels = Record<string, string>;

export function createSnippetRow(
  snippet: ISnippet,
  onInsert: (s: ISnippet) => void,
  onCopy: (s: ISnippet) => void,
  onTerminal: (s: ISnippet) => void,
  labels: Labels
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'jp-CodeLoader-snip';
  card.title = snippet.code;

  // Head
  const head = document.createElement('div');
  head.className = 'jp-CodeLoader-snipHead';

  const title = document.createElement('span');
  title.className = 'jp-CodeLoader-snipTitle';
  title.textContent = snippet.title;
  head.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'jp-CodeLoader-snipActions';

  const insertBtn = _btn(
    Svg.chevron,
    labels['snippet.button.insert'] || 'Insert into notebook',
    e => {
      e.stopPropagation();
      onInsert(snippet);
    }
  );
  actions.appendChild(insertBtn);

  if (snippet.code_lang === 'bash') {
    const termBtn = _btn(
      Svg.terminal,
      labels['snippet.button.terminal'] || 'Send to terminal',
      e => {
        e.stopPropagation();
        onTerminal(snippet);
      }
    );
    actions.appendChild(termBtn);
  }

  const copyBtn = _btn(
    Svg.copy,
    labels['snippet.button.copy'] || 'Copy to clipboard',
    e => {
      e.stopPropagation();
      onCopy(snippet);
    }
  );
  actions.appendChild(copyBtn);

  head.appendChild(actions);
  card.appendChild(head);

  // Code preview
  const code = document.createElement('div');
  code.className = 'jp-CodeLoader-snipCode';
  const firstLine = snippet.code.split('\n')[0];
  code.textContent =
    firstLine.length > 60 ? firstLine.slice(0, 60) + '…' : firstLine;
  card.appendChild(code);

  // Tags
  const tags = document.createElement('div');
  tags.className = 'jp-CodeLoader-tags';

  const codeTag = document.createElement('span');
  codeTag.className = 'jp-CodeLoader-tag jp-CodeLoader-tag--code';
  codeTag.textContent = snippet.code_lang;
  tags.appendChild(codeTag);

  for (const tag of snippet.tags) {
    const t = document.createElement('span');
    t.className = 'jp-CodeLoader-tag jp-CodeLoader-tag--neutral';
    t.textContent = tag;
    tags.appendChild(t);
  }

  card.appendChild(tags);

  return card;
}

function _btn(
  iconSvg: string,
  title: string,
  handler: (e: Event) => void
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'jp-CodeLoader-snipBtn';
  btn.title = title;
  btn.innerHTML = iconSvg;
  btn.addEventListener('click', handler);
  return btn;
}
