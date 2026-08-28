import type { TabVm } from './tabVm';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';
import { joinStories } from './joinStories';
import { searchKnowledge } from './knowledgeSearch';

function renderSearchForm(query: string): string {
  return `
    <form class="kb-search" data-kb-search-form>
      <input type="search" name="q" placeholder="Ask about a requirement or story…" value="${escapeHtml(query)}" aria-label="Search the knowledge base" />
      <button type="submit">Search</button>
    </form>`;
}

function renderSearchResults(vm: TabVm, query: string): string {
  const hits = searchKnowledge(vm.plan, query);
  return `
    <a class="back-link" href="${tabHref('knowledge-base')}">&larr; Back to knowledge base</a>
    ${renderSearchForm(query)}
    <h2>Results for "${escapeHtml(query)}"</h2>
    ${
      hits.length === 0
        ? `<p class="empty-state">I can't answer that from the data I have. Try a requirement id, a story id, or a word from their text.</p>`
        : `<ul class="detail-list">${hits.map((h) => `<li><a href="${h.href}">${escapeHtml(h.label)}</a> — ${escapeHtml(h.snippet)} <span class="basis-note">(from ${escapeHtml(h.tab)})</span></li>`).join('')}</ul>`
    }`;
}

function renderTraceabilityTable(vm: TabVm): string {
  const joined = joinStories(vm.plan.stories, vm.progress);
  return `
    <table class="task-table">
      <thead><tr><th>Requirement</th><th>Kind</th><th>Priority</th><th>Covered by</th><th>Status</th></tr></thead>
      <tbody>
        ${vm.plan.requirements
          .map((req) => {
            const isGap = req.priority === 'must' && req.fulfilled_by.length === 0;
            const stories = req.fulfilled_by.map((id) => joined.find((s) => s.id === id)).filter(Boolean);
            const allVerified = stories.length > 0 && stories.every((s) => s?.state === 'verified');
            return `
        <tr class="${isGap ? 'row--gap' : ''}">
          <td><a href="${detailHref('knowledge-base', req.id)}">${escapeHtml(req.id)}</a> — ${escapeHtml(req.statement)}</td>
          <td>${escapeHtml(req.kind)}</td>
          <td>${escapeHtml(req.priority)}</td>
          <td>${req.fulfilled_by.length === 0 ? (isGap ? 'GAP — no story covers this' : 'context only') : req.fulfilled_by.map(escapeHtml).join(', ')}</td>
          <td>${stories.length === 0 ? '—' : allVerified ? 'verified' : 'not fully verified'}</td>
        </tr>`;
          })
          .join('')}
      </tbody>
    </table>`;
}

function renderRequirementDetail(vm: TabVm, reqId: string): string {
  const req = vm.plan.requirements.find((r) => r.id === reqId);
  if (!req) return '';
  const joined = joinStories(vm.plan.stories, vm.progress).filter((s) => req.fulfilled_by.includes(s.id));
  return `
    <a class="back-link" href="${tabHref('knowledge-base')}">&larr; Back to knowledge base</a>
    <h2>${escapeHtml(req.id)}</h2>
    <p>${escapeHtml(req.statement)}</p>
    <p><strong>Kind:</strong> ${escapeHtml(req.kind)} · <strong>Priority:</strong> ${escapeHtml(req.priority)} · <strong>Cluster:</strong> ${escapeHtml(req.cluster)}</p>
    ${
      joined.length === 0
        ? `<p class="empty-state">No story currently fulfils this requirement.</p>`
        : `<ul class="detail-list">${joined.map((s) => `<li><a href="${detailHref('project-management', s.id)}">${escapeHtml(s.id)} — ${escapeHtml(s.title)}</a> (${escapeHtml(s.state)})</li>`).join('')}</ul>`
    }`;
}

export function renderKnowledgeBaseTab(vm: TabVm): string {
  if (vm.detail?.startsWith('search/')) {
    return renderSearchResults(vm, vm.detail.slice('search/'.length));
  }
  if (vm.detail) {
    const detail = renderRequirementDetail(vm, vm.detail);
    if (detail) return detail;
    return `
      <a class="back-link" href="${tabHref('knowledge-base')}">&larr; Back to knowledge base</a>
      <p class="empty-state">That requirement is not in the current plan.</p>`;
  }

  return `
    <section class="tab-section">
      ${renderSearchForm('')}
    </section>
    <section class="tab-section">
      <h2>Traceability</h2>
      ${vm.plan.requirements.length === 0 ? `<p class="empty-state">No requirements are recorded yet.</p>` : renderTraceabilityTable(vm)}
    </section>`;
}
