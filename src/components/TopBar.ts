/**
 * Top toolbar — brand mark + eyebrow + title + icon actions.
 * Used by both the setup form and the connected sidebar.
 */

import { Svg } from '../svg_icons';

export interface ITopBarAction {
  icon: string; // svg innerHTML
  title: string;
  onClick: () => void;
}

export function createTopBar(
  title: string,
  eyebrow: string,
  actions: ITopBarAction[] = []
): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'jp-CodeLoader-topbar';

  const brand = document.createElement('div');
  brand.className = 'jp-CodeLoader-brandMark';
  brand.setAttribute('aria-hidden', 'true');
  brand.innerHTML = Svg.codeDownload;
  const wedge = document.createElement('span');
  wedge.className = 'jp-CodeLoader-brandWedge';
  brand.appendChild(wedge);

  const titles = document.createElement('div');
  titles.className = 'jp-CodeLoader-topbarTitles';

  const eyebrowEl = document.createElement('span');
  eyebrowEl.className = 'jp-CodeLoader-topbarEyebrow';
  eyebrowEl.textContent = eyebrow;

  const titleEl = document.createElement('span');
  titleEl.className = 'jp-CodeLoader-topbarTitle';
  titleEl.textContent = title;

  titles.appendChild(eyebrowEl);
  titles.appendChild(titleEl);

  const actionsWrap = document.createElement('div');
  actionsWrap.className = 'jp-CodeLoader-topbarActions';

  for (const action of actions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jp-CodeLoader-iconbtn';
    btn.title = action.title;
    btn.setAttribute('aria-label', action.title);
    btn.innerHTML = action.icon;
    btn.addEventListener('click', action.onClick);
    actionsWrap.appendChild(btn);
  }

  bar.appendChild(brand);
  bar.appendChild(titles);
  bar.appendChild(actionsWrap);

  return bar;
}

export function updateTopBarTitle(bar: HTMLElement, title: string): void {
  const el = bar.querySelector('.jp-CodeLoader-topbarTitle');
  if (el) {
    el.textContent = title;
  }
}
