/**
 * Code item row component for the Code examples tab.
 */

import { ICodeItem } from '../model';

type Labels = Record<string, string>;

export function createCodeItemRow(
  item: ICodeItem,
  domainId: string,
  onOpen: (domain: string, file: string) => void,
  difficultyLabels: Record<string, string>,
  labels: Labels
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'jp-CodeLoader-codeItem';
  row.title = item.description;

  // Title line with open button
  const titleLine = document.createElement('div');
  titleLine.className = 'jp-CodeLoader-codeItem-title';

  // File type icon
  const icon = document.createElement('span');
  icon.className = 'jp-CodeLoader-codeItem-icon';
  if (item.file.endsWith('.ipynb')) {
    icon.textContent = '\uD83D\uDCD3';
    icon.title = labels['code.tooltip.notebook'] || 'Notebook';
  } else if (item.file.endsWith('.py')) {
    icon.textContent = '\uD83D\uDC0D';
    icon.title = labels['code.tooltip.python'] || 'Python script';
  } else if (item.file.endsWith('.R') || item.file.endsWith('.Rmd')) {
    icon.textContent = '\uD83D\uDCCA';
    icon.title = labels['code.tooltip.r'] || 'R script';
  } else if (item.file.endsWith('.sh')) {
    icon.textContent = '\uD83D\uDCBB';
    icon.title = labels['code.tooltip.bash'] || 'Bash script';
  } else {
    icon.textContent = '\uD83D\uDCC4';
    icon.title = labels['code.tooltip.script'] || 'Script';
  }

  const titleText = document.createElement('span');
  titleText.className = 'jp-CodeLoader-codeItem-titleText';
  titleText.textContent = item.title;

  // Open button
  const openBtn = document.createElement('button');
  openBtn.className = 'jp-CodeLoader-codeItem-openBtn';
  openBtn.textContent = '\u2B9E';
  openBtn.title = labels['code.button.open'] || 'Copy to workspace and open';
  openBtn.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    onOpen(domainId, item.file);
  });

  titleLine.appendChild(icon);
  titleLine.appendChild(titleText);

  // Translation indicator
  if (item._file_translated) {
    const translated = document.createElement('span');
    translated.className =
      'jp-CodeLoader-badge jp-CodeLoader-badge--translated';
    translated.textContent = '\u2713';
    translated.title = labels['code.badge.translated'] || 'Translated';
    titleLine.appendChild(translated);
  }

  titleLine.appendChild(openBtn);

  // Metadata line
  const metaLine = document.createElement('div');
  metaLine.className = 'jp-CodeLoader-codeItem-meta';

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

  if (badgeLine.children.length > 0) {
    row.appendChild(badgeLine);
  }

  return row;
}
