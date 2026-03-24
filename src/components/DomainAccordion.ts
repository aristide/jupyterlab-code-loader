/**
 * Collapsible domain accordion component.
 */

export function createDomainAccordion(
  domainName: string,
  itemCount: number,
  hiddenCount: number,
  expanded: boolean
): HTMLElement {
  const details = document.createElement('details');
  details.className = 'jp-CodeLoader-accordion';
  if (expanded) {
    details.open = true;
  }
  if (itemCount === 0) {
    details.classList.add('jp-CodeLoader-accordion--empty');
  }

  const summary = document.createElement('summary');
  summary.className = 'jp-CodeLoader-accordionHeader';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'jp-CodeLoader-accordionTitle';
  titleSpan.textContent = domainName;

  const countBadge = document.createElement('span');
  countBadge.className = 'jp-CodeLoader-accordionCount';
  countBadge.textContent = String(itemCount);

  summary.appendChild(titleSpan);
  summary.appendChild(countBadge);

  const content = document.createElement('div');
  content.className = 'jp-CodeLoader-accordionContent';

  // Hidden items notice
  if (hiddenCount > 0) {
    const hidden = document.createElement('div');
    hidden.className = 'jp-CodeLoader-hiddenNotice';
    hidden.textContent = `${hiddenCount} hidden`;
    content.appendChild(hidden);
  }

  details.appendChild(summary);
  details.appendChild(content);

  return details;
}

/**
 * Get the content container of an accordion for appending items.
 */
export function getAccordionContent(accordion: HTMLElement): HTMLElement {
  return accordion.querySelector(
    '.jp-CodeLoader-accordionContent'
  ) as HTMLElement;
}

/**
 * Update the count badge on an accordion header.
 */
export function updateAccordionCount(
  accordion: HTMLElement,
  count: number,
  hiddenCount: number
): void {
  const badge = accordion.querySelector('.jp-CodeLoader-accordionCount');
  if (badge) {
    badge.textContent = String(count);
  }

  accordion.classList.toggle('jp-CodeLoader-accordion--empty', count === 0);
}
