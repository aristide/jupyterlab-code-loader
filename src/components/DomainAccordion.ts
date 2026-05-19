/**
 * Collapsible list group for a domain.
 * Replaces the native <details> element to match the Data4Now caret style.
 */

import { Svg } from '../svg_icons';

export function createDomainAccordion(
  domainName: string,
  itemCount: number,
  hiddenCount: number,
  expanded: boolean
): HTMLElement {
  const group = document.createElement('div');
  group.className =
    'jp-CodeLoader-lgrp' + (expanded ? '' : ' jp-CodeLoader-lgrp--collapsed');

  const head = document.createElement('div');
  head.className = 'jp-CodeLoader-lgrpHead';
  head.setAttribute('role', 'button');
  head.setAttribute('aria-expanded', String(expanded));

  const caret = document.createElement('span');
  caret.className = 'jp-CodeLoader-lgrpCaret';
  caret.innerHTML = Svg.caret;
  head.appendChild(caret);

  const title = document.createElement('span');
  title.className = 'jp-CodeLoader-lgrpTitle';
  title.textContent = domainName;
  head.appendChild(title);

  const count = document.createElement('span');
  count.className = 'jp-CodeLoader-lgrpCount';
  count.textContent = String(itemCount);
  head.appendChild(count);

  const items = document.createElement('div');
  items.className = 'jp-CodeLoader-lgrpItems';

  head.addEventListener('click', () => {
    const collapsed = group.classList.toggle('jp-CodeLoader-lgrp--collapsed');
    head.setAttribute('aria-expanded', String(!collapsed));
  });

  group.appendChild(head);
  group.appendChild(items);

  if (hiddenCount > 0) {
    const notice = document.createElement('div');
    notice.className = 'jp-CodeLoader-hiddenNotice';
    notice.textContent = `${hiddenCount} hidden`;
    items.appendChild(notice);
  }

  return group;
}

export function getAccordionContent(accordion: HTMLElement): HTMLElement {
  return accordion.querySelector('.jp-CodeLoader-lgrpItems') as HTMLElement;
}

export function updateAccordionCount(
  accordion: HTMLElement,
  count: number,
  _hiddenCount: number
): void {
  const badge = accordion.querySelector('.jp-CodeLoader-lgrpCount');
  if (badge) {
    badge.textContent = String(count);
  }
}
