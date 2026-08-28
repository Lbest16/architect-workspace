import { TAB_IDS, TAB_LABELS, tabHref, type TabId } from './route';
import { escapeHtml } from './escapeHtml';

export function renderTabNav(activeTab: TabId): string {
  const items = TAB_IDS.map((tab) => {
    const activeClass = tab === activeTab ? ' tab-nav__link--active' : '';
    return `<li><a class="tab-nav__link${activeClass}" href="${tabHref(tab)}" aria-current="${tab === activeTab ? 'page' : 'false'}">${escapeHtml(TAB_LABELS[tab])}</a></li>`;
  }).join('');

  return `<nav class="tab-nav" aria-label="Command Center tabs"><ul class="tab-nav__list">${items}</ul></nav>`;
}
