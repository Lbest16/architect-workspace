import type { TabVm } from './tabVm';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';

export function renderOutcomesTab(vm: TabVm): string {
  const measures = vm.plan.derived.measures;

  if (vm.detail) {
    const measure = measures.find((m) => m.id === vm.detail);
    if (!measure) {
      return `
        <a class="back-link" href="${tabHref('outcomes')}">&larr; Back to outcomes</a>
        <p class="empty-state">That measure is not in the current plan.</p>`;
    }
    return `
      <a class="back-link" href="${tabHref('outcomes')}">&larr; Back to outcomes</a>
      <h2>${escapeHtml(measure.id)}</h2>
      <p>${escapeHtml(measure.statement)}</p>
      <p class="empty-state">No measurement has been taken yet — this is the target, not a result.</p>`;
  }

  if (measures.length === 0) {
    return `<p class="empty-state">Your plan carries no numeric target yet. Once one is added, it shows up here as a card.</p>`;
  }

  return `
    <div class="card-grid">
      ${measures
        .map(
          (m) => `
        <a class="card" href="${detailHref('outcomes', m.id)}">
          <div class="card__id">${escapeHtml(m.id)}</div>
          <div class="card__body">${escapeHtml(m.statement)}</div>
        </a>`,
        )
        .join('')}
    </div>`;
}
