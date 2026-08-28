import type { TabVm } from './tabVm';
import type { StoryPlan } from './loadPlan';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';

function narrativesForRole(stories: StoryPlan[], role: string): StoryPlan[] {
  const needle = `as a ${role.toLowerCase()}`;
  return stories.filter((s) => s.narrative.toLowerCase().includes(needle));
}

export function renderUsersTab(vm: TabVm): string {
  const roles = vm.plan.derived.roles;

  if (vm.detail) {
    const role = roles.find((r) => r === vm.detail);
    if (!role) {
      return `
        <a class="back-link" href="${tabHref('users')}">&larr; Back to users</a>
        <p class="empty-state">That role is not in the current plan.</p>`;
    }
    const stories = narrativesForRole(vm.plan.stories, role);
    return `
      <a class="back-link" href="${tabHref('users')}">&larr; Back to users</a>
      <h2>${escapeHtml(role)}</h2>
      ${
        stories.length === 0
          ? `<p class="empty-state">No story narrative currently names this role.</p>`
          : `<ul class="detail-list">${stories.map((s) => `<li><strong>${escapeHtml(s.id)}</strong> — ${escapeHtml(s.narrative)}</li>`).join('')}</ul>`
      }`;
  }

  if (roles.length === 0) {
    return `<p class="empty-state">No roles have been extracted from your stories yet.</p>`;
  }

  return `
    <div class="card-grid">
      ${roles
        .map((role) => {
          const count = narrativesForRole(vm.plan.stories, role).length;
          return `
        <a class="card" href="${detailHref('users', role)}">
          <div class="card__id">${escapeHtml(role)}</div>
          <div class="card__body">${count} ${count === 1 ? 'story' : 'stories'}</div>
        </a>`;
        })
        .join('')}
    </div>`;
}
