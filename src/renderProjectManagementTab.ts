import type { TabVm } from './tabVm';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';
import { joinStories, type JoinedStory } from './joinStories';

function renderGanttBar(weekStart: number, weekEnd: number, maxWeek: number): string {
  const span = Math.max(maxWeek, 1);
  const left = (weekStart / span) * 100;
  const width = Math.max((weekEnd - weekStart) / span, 0.02) * 100;
  return `<div class="gantt-bar" style="left:${left}%;width:${width}%"></div>`;
}

function renderReleaseList(vm: TabVm): string {
  const releases = vm.plan.releases;
  if (releases.length === 0) return `<p class="empty-state">No releases are planned yet.</p>`;
  const maxWeek = Math.max(...releases.map((r) => r.week_end), 1);
  const joined = joinStories(vm.plan.stories, vm.progress);

  return `
    <div class="gantt">
      ${releases
        .map((r) => {
          const storiesInRelease = joined.filter((s) => r.story_ids.includes(s.id));
          const verifiedCount = storiesInRelease.filter((s) => s.state === 'verified').length;
          const dates = r.starts_on && r.ends_on ? `${escapeHtml(r.starts_on)} → ${escapeHtml(r.ends_on)}` : 'dates not set yet';
          return `
        <a class="gantt-row" href="${detailHref('project-management', r.key)}">
          <div class="gantt-row__label">${escapeHtml(r.key)} — ${escapeHtml(r.name)}</div>
          <div class="gantt-row__track">${renderGanttBar(r.week_start, r.week_end, maxWeek)}</div>
          <div class="gantt-row__meta">${dates} · ${verifiedCount}/${storiesInRelease.length} verified</div>
        </a>`;
        })
        .join('')}
    </div>`;
}

function renderTaskList(vm: TabVm): string {
  const joined = joinStories(vm.plan.stories, vm.progress);
  if (joined.length === 0) return `<p class="empty-state">No stories are planned yet.</p>`;

  return `
    <table class="task-table">
      <thead><tr><th>Story</th><th>Release</th><th>Due</th><th>Baseline due</th><th>Status</th></tr></thead>
      <tbody>
        ${joined
          .map(
            (s) => `
        <tr>
          <td><a href="${detailHref('project-management', s.id)}">${escapeHtml(s.id)} — ${escapeHtml(s.title)}</a></td>
          <td>${escapeHtml(s.release)}</td>
          <td>${s.due_on ? escapeHtml(s.due_on) : 'not set'}</td>
          <td>${s.due_baseline_on ? escapeHtml(s.due_baseline_on) : 'not set'}</td>
          <td><span class="pill ${s.state === 'verified' ? 'pill--good' : 'pill--warn'}">${escapeHtml(s.state)}</span></td>
        </tr>`,
          )
          .join('')}
      </tbody>
    </table>`;
}

function renderReleaseDetail(vm: TabVm, releaseKey: string): string {
  const release = vm.plan.releases.find((r) => r.key === releaseKey);
  if (!release) return '';
  const joined = joinStories(vm.plan.stories, vm.progress).filter((s) => release.story_ids.includes(s.id));
  return `
    <a class="back-link" href="${tabHref('project-management')}">&larr; Back to project management</a>
    <h2>${escapeHtml(release.key)} — ${escapeHtml(release.name)}</h2>
    <p>${escapeHtml(release.goal)}</p>
    <p class="empty-state">Demo target: ${escapeHtml(release.demo)}</p>
    ${
      joined.length === 0
        ? `<p class="empty-state">No stories are assigned to this release.</p>`
        : `<ul class="detail-list">${joined.map((s) => `<li><a href="${detailHref('project-management', s.id)}">${escapeHtml(s.id)} — ${escapeHtml(s.title)}</a> (${escapeHtml(s.state)})</li>`).join('')}</ul>`
    }`;
}

function renderStoryDetail(vm: TabVm, storyId: string): string {
  const [story] = joinStories(vm.plan.stories, vm.progress).filter((s: JoinedStory) => s.id === storyId);
  if (!story) return '';
  return `
    <a class="back-link" href="${tabHref('project-management')}">&larr; Back to project management</a>
    <h2>${escapeHtml(story.id)} — ${escapeHtml(story.title)}</h2>
    <p>${escapeHtml(story.narrative)}</p>
    <p><span class="pill ${story.state === 'verified' ? 'pill--good' : 'pill--warn'}">${escapeHtml(story.state)}</span> — ${story.criteriaPassed} of ${story.criteriaTotal} criteria passed</p>
    <h3>Acceptance criteria</h3>
    <ul class="detail-list">${story.acceptance.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
    <h3>Owner</h3>
    <p>${escapeHtml(story.owner_agent)}</p>
    ${story.blocked_by.length > 0 ? `<h3>Blocked by</h3><ul class="detail-list">${story.blocked_by.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
    ${story.commitUrl ? `<p><a href="${escapeHtml(story.commitUrl)}">Verifying commit</a></p>` : `<p class="empty-state">No verifying commit recorded yet.</p>`}`;
}

export function renderProjectManagementTab(vm: TabVm): string {
  if (vm.detail) {
    const detail = vm.detail.startsWith('STORY-') ? renderStoryDetail(vm, vm.detail) : renderReleaseDetail(vm, vm.detail);
    if (detail) return detail;
    return `
      <a class="back-link" href="${tabHref('project-management')}">&larr; Back to project management</a>
      <p class="empty-state">That release or story is not in the current plan.</p>`;
  }

  return `
    <section class="tab-section">
      <h2>Releases</h2>
      ${renderReleaseList(vm)}
    </section>
    <section class="tab-section">
      <h2>Every task</h2>
      ${renderTaskList(vm)}
    </section>`;
}
