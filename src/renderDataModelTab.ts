import type { TabVm } from './tabVm';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';
import { dataModelEntities } from './dataModelSchema';

export function renderDataModelTab(vm: TabVm): string {
  const note = `<p class="empty-state">A starting point derived from the current requirements, not the final schema — see docs/REQUIREMENTS.md.</p>`;

  if (vm.detail) {
    const entity = dataModelEntities.find((e) => e.name === vm.detail);
    if (!entity) {
      return `<a class="back-link" href="${tabHref('data-model')}">&larr; Back to data model</a><p class="empty-state">No such entity.</p>`;
    }
    const knownIds = new Set(vm.plan.requirements.map((r) => r.id));
    return `
      <a class="back-link" href="${tabHref('data-model')}">&larr; Back to data model</a>
      <h2>${escapeHtml(entity.name)}</h2>
      <p>${escapeHtml(entity.purpose)}</p>
      <h3>Fields</h3>
      <ul class="detail-list">${entity.fields.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
      <h3>Relationships</h3>
      <ul class="detail-list">${entity.relationships.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      <h3>Traces to</h3>
      <ul class="detail-list">${entity.requirementIds
        .map((id) => (knownIds.has(id) ? `<li><a href="${detailHref('knowledge-base', id)}">${escapeHtml(id)}</a></li>` : `<li>${escapeHtml(id)}</li>`))
        .join('')}</ul>`;
  }

  return `
    ${note}
    <div class="card-grid">
      ${dataModelEntities
        .map(
          (e) => `
        <a class="card" href="${detailHref('data-model', e.name)}">
          <div class="card__id">${escapeHtml(e.name)}</div>
          <div class="card__body">${escapeHtml(e.purpose)}</div>
        </a>`,
        )
        .join('')}
    </div>`;
}
