import type { TabVm } from './tabVm';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';

export function renderSystemsTab(vm: TabVm): string {
  const systems = vm.plan.derived.systems;

  if (vm.detail) {
    const name = systems.find((s) => s === vm.detail);
    if (!name) {
      return `
        <a class="back-link" href="${tabHref('systems')}">&larr; Back to systems</a>
        <p class="empty-state">That system is not in the current plan.</p>`;
    }
    return `
      <a class="back-link" href="${tabHref('systems')}">&larr; Back to systems</a>
      <h2>${escapeHtml(name)}</h2>
      <p class="live-indicator">
        <span class="status-dot status-dot--unknown" aria-hidden="true"></span>
        <span>Not checked from here — nothing in this repo can confirm a live connection.</span>
      </p>
      <p class="empty-state">The plan only knows this system's name. Whether it is actually reachable is a fact about your running system, not this page.</p>`;
  }

  if (systems.length === 0) {
    return `<p class="empty-state">Your plan names no external system yet.</p>`;
  }

  return `
    <div class="card-grid">
      ${systems
        .map(
          (name) => `
        <a class="card" href="${detailHref('systems', name)}">
          <div class="live-indicator">
            <span class="status-dot status-dot--unknown" aria-hidden="true"></span>
            <span class="card__id">${escapeHtml(name)}</span>
          </div>
          <div class="card__body">not checked from here</div>
        </a>`,
        )
        .join('')}
    </div>`;
}
