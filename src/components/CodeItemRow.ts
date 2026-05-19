/**
 * Code item row — icon + body (title, meta, tags) + chevron.
 * Row click opens the example; the chevron is purely decorative.
 */

import { ICodeItem } from '../model';
import { Svg } from '../svg_icons';

type Labels = Record<string, string>;

export function createCodeItemRow(
  item: ICodeItem,
  domainId: string,
  onOpen: (domain: string, file: string) => void,
  difficultyLabels: Record<string, string>,
  labels: Labels
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'jp-CodeLoader-item';
  row.title = item.description || item.title;
  row.tabIndex = 0;
  row.setAttribute('role', 'button');

  // Icon
  const icon = document.createElement('div');
  const isNotebook = item.type === 'notebook' || item.file.endsWith('.ipynb');
  icon.className =
    'jp-CodeLoader-itemIcon ' +
    (isNotebook
      ? 'jp-CodeLoader-itemIcon--notebook'
      : 'jp-CodeLoader-itemIcon--script');
  icon.innerHTML = isNotebook ? Svg.notebook : Svg.script;

  // Body
  const body = document.createElement('div');
  body.className = 'jp-CodeLoader-itemBody';

  const title = document.createElement('div');
  title.className = 'jp-CodeLoader-itemTitle';
  title.textContent = item.title;
  body.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'jp-CodeLoader-itemMeta';
  const typeBadge =
    item.type === 'notebook'
      ? labels['code.type.notebook'] || 'notebook'
      : labels['code.type.script'] || 'script';
  const parts: string[] = [typeBadge];
  if (item.code_lang) {
    parts.push(item.code_lang);
  }
  if (item.difficulty && difficultyLabels[item.difficulty]) {
    parts.push(difficultyLabels[item.difficulty]);
  }
  if (item.estimated_time) {
    parts.push(item.estimated_time);
  }
  parts.forEach((part, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'jp-CodeLoader-sep';
      sep.textContent = '·';
      meta.appendChild(sep);
    }
    const span = document.createElement('span');
    span.textContent = part;
    meta.appendChild(span);
  });
  body.appendChild(meta);

  // Tags
  if (item._tags_display) {
    const tags = document.createElement('div');
    tags.className = 'jp-CodeLoader-tags';

    const langTag = document.createElement('span');
    langTag.className = 'jp-CodeLoader-tag jp-CodeLoader-tag--lang';
    langTag.textContent = `lang:${item._tags_display.content_lang}`;
    tags.appendChild(langTag);

    const codeTag = document.createElement('span');
    codeTag.className = 'jp-CodeLoader-tag jp-CodeLoader-tag--code';
    codeTag.textContent = `code:${item._tags_display.code_lang}`;
    tags.appendChild(codeTag);

    if (item._file_translated) {
      const tr = document.createElement('span');
      tr.className = 'jp-CodeLoader-tag jp-CodeLoader-tag--translated';
      tr.textContent = labels['code.badge.translated'] || 'Translated';
      tags.appendChild(tr);
    }

    body.appendChild(tags);
  }

  // Chevron
  const chev = document.createElement('button');
  chev.type = 'button';
  chev.className = 'jp-CodeLoader-itemChev';
  chev.title = labels['code.button.open'] || 'Copy to workspace and open';
  chev.innerHTML = Svg.chevron;

  // Whole row triggers open
  const open = (e: Event) => {
    e.stopPropagation();
    onOpen(domainId, item.file);
  };
  row.addEventListener('click', open);
  row.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(domainId, item.file);
    }
  });
  chev.addEventListener('click', open);

  row.appendChild(icon);
  row.appendChild(body);
  row.appendChild(chev);

  return row;
}
