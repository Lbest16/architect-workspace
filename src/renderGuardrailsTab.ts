import type { TabVm } from './tabVm';
import type { Plan } from './loadPlan';
import type { Progress } from './loadProgress';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';
import { joinStories, type JoinedStory } from './joinStories';

function fulfillingStories(plan: Plan, progress: Progress, reqId: string): JoinedStory[] {
  const req = plan.requirements.find((r) => r.id === reqId);
  if (!req) return [];
  const joined = joinStories(plan.stories, progress);
  return req.fulfilled_by.map((id) => joined.find((s) => s.id === id)).filter((s): s is JoinedStory => Boolean(s));
}

function isEnforced(stories: JoinedStory[]): boolean {
  return stories.length > 0 && stories.every((s) => s.state === 'verified');
}

export function renderGuardrailsTab(vm: TabVm): string {
  const guardrails = vm.plan.derived.guardrails;

  if (vm.detail) {
    const guardrail = guardrails.find((g) => g.id === vm.detail);
    if (!guardrail) {
      return `
        <a class="back-link" href="${tabHref('guardrails')}">&larr; Back to guardrails</a>
        <p class="empty-state">That guardrail is not in the current plan.</p>`;
    }
    const stories = fulfillingStories(vm.plan, vm.progress, guardrail.id);
    const enforced = isEnforced(stories);
    return `
      <a class="back-link" href="${tabHref('guardrails')}">&larr; Back to guardrails</a>
      <h2>${escapeHtml(guardrail.id)}</h2>
      <p>${escapeHtml(guardrail.statement)}</p>
      <p class="pill ${enforced ? 'pill--good' : 'pill--warn'}">${enforced ? 'Enforced' : 'Not yet enforced — a promise made, not yet kept'}</p>
      ${
        stories.length === 0
          ? `<p class="empty-state">No story currently fulfils this guardrail.</p>`
          : `<ul class="detail-list">${stories.map((s) => `<li><strong>${escapeHtml(s.id)}</strong> — ${escapeHtml(s.title)} (${escapeHtml(s.state)})</li>`).join('')}</ul>`
      }`;
  }

  if (guardrails.length === 0) {
    return `<p class="empty-state">Your plan has no safety (SAFE) requirement yet, so there is nothing to guard here.</p>`;
  }

  return `
    <div class="card-grid">
      ${guardrails
        .map((g) => {
          const enforced = isEnforced(fulfillingStories(vm.plan, vm.progress, g.id));
          return `
        <a class="card" href="${detailHref('guardrails', g.id)}">
          <div class="card__id">${escapeHtml(g.id)}</div>
          <div class="card__body">${escapeHtml(g.statement)}</div>
          <div class="pill ${enforced ? 'pill--good' : 'pill--warn'}">${enforced ? 'Enforced' : 'Not yet enforced'}</div>
        </a>`;
        })
        .join('')}
    </div>`;
}
