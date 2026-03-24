/**
 * Code item row component for the Code examples tab.
 */

import { ICodeItem } from '../model';

export function createCodeItemRow(
  item: ICodeItem,
  domainId: string,
  onDoubleClick: (domain: string, file: string) => void,
  difficultyLabels: Record<string, string>
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'jp-CodeLoader-codeItem';
  row.title = item.description;

  // Title line
  const titleLine = document.createElement('div');
  titleLine.className = 'jp-CodeLoader-codeItem-title';

  // File type icon
  const icon = document.createElement('span');
  icon.className = 'jp-CodeLoader-codeItem-icon';
  if (item.file.endsWith('.ipynb')) {
    icon.textContent = '\uD83D\uDCD3'; // notebook emoji
    icon.title = 'Notebook';
  } else if (item.file.endsWith('.py')) {
    icon.textContent = '\uD83D\uDC0D'; // python emoji
    icon.title = 'Python script';
  } else if (item.file.endsWith('.R') || item.file.endsWith('.Rmd')) {
    icon.textContent = '\uD83D\uDCCA'; // chart emoji
    icon.title = 'R script';
  } else {
    icon.textContent = '\uD83D\uDCC4'; // document emoji
    icon.title = 'Script';
  }

  const titleText = document.createElement('span');
  titleText.className = 'jp-CodeLoader-codeItem-titleText';
  titleText.textContent = item.title;

  titleLine.appendChild(icon);
  titleLine.appendChild(titleText);

  // Translation indicator
  if (item._file_translated) {
    const translated = document.createElement('span');
    translated.className =
      'jp-CodeLoader-badge jp-CodeLoader-badge--translated';
    translated.textContent = '\u2713';
    translated.title = 'Translated';
    titleLine.appendChild(translated);
  } else if (item._resolved_locale !== 'en' || item._content_lang !== 'en') {
    // Falls back to English
  }

  // Metadata line
  const metaLine = document.createElement('div');
  metaLine.className = 'jp-CodeLoader-codeItem-meta';

  const typeBadge = item.type === 'notebook' ? 'notebook' : 'script';
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

  metaLine.textContent = parts.join(' \u00B7 ');

  // Language badges
  const badgeLine = document.createElement('div');
  badgeLine.className = 'jp-CodeLoader-codeItem-badges';

  if (item._tags_display) {
    const langBadge = document.createElement('span');
    langBadge.className = 'jp-CodeLoader-badge jp-CodeLoader-badge--lang';
    langBadge.textContent = `lang:${item._tags_display.content_lang}`;
    badgeLine.appendChild(langBadge);

    const codeBadge = document.createElement('span');
    codeBadge.className = 'jp-CodeLoader-badge jp-CodeLoader-badge--code';
    codeBadge.textContent = `code:${item._tags_display.code_lang}`;
    badgeLine.appendChild(codeBadge);
  }

  row.appendChild(titleLine);
  row.appendChild(metaLine);

  // Only add badge line if it has content
  if (badgeLine.children.length > 0) {
    row.appendChild(badgeLine);
  }

  // Double-click to copy and open
  row.addEventListener('dblclick', () => {
    onDoubleClick(domainId, item.file);
  });

  return row;
}
