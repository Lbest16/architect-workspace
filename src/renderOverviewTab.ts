import type { TabVm } from './tabVm';
import { escapeHtml } from './escapeHtml';
import { joinStories } from './joinStories';
import { getCurrentRelease } from './currentRelease';
import { getLiveIndicators, type LiveIndicator } from './liveStatus';
import { detailHref, tabHref } from './route';
import { deriveTotals } from './deriveTotals';

function renderCurrentRelease(vm: TabVm): string {
  const joined = joinStories(vm.plan.stories, vm.progress);
  const { release, basis } = getCurrentRelease(vm.plan.releases, joined, vm.todayIso);
  if (!release) return `<p class="empty-state">No release is planned yet. Nothing to show.</p>`;

  const basisNote =
    basis === 'progress'
      ? ' <span class="basis-note">(by build progress — no schedule dates set yet)</span>'
      : '';
  const storyCount = release.story_ids.length;

  return `
    <a class="release-card" href="${detailHref('project-management', release.key)}">
      <div class="release-card__id">${escapeHtml(release.key)}</div>
      <div class="release-card__name">${escapeHtml(release.name)}${basisNote}</div>
      <div class="release-card__meta">${storyCount} ${storyCount === 1 ? 'story' : 'stories'}</div>
    </a>`;
}

function renderTotals(vm: TabVm): string {
  const totals = deriveTotals(vm.plan, vm.progress);
  const points = totals.points_awarded === null ? 'not available' : String(totals.points_awarded);

  return `
    <a class="stat-list" href="${tabHref('project-management')}">
      <span class="stat-list__item"><strong>${totals.stories_verified}</strong> of <strong>${totals.stories_total}</strong> stories verified</span>
      <span class="stat-list__item"><strong>${totals.criteria_passed}</strong> of <strong>${totals.criteria_total}</strong> criteria passed</span>
      <span class="stat-list__item">Points awarded: <strong>${escapeHtml(points)}</strong></span>
    </a>`;
}

function renderLiveIndicator(indicator: LiveIndicator): string {
  const dotClass = indicator.status === 'live' ? 'status-dot status-dot--live' : 'status-dot status-dot--unknown';
  const checked = indicator.lastCheckedIso ? `checked ${escapeHtml(indicator.lastCheckedIso)}` : 'not checked from here';
  return `
    <li class="live-indicator">
      <span class="${dotClass}" aria-hidden="true"></span>
      <span class="live-indicator__label">${escapeHtml(indicator.label)}</span>
      <span class="live-indicator__checked">${checked}</span>
    </li>`;
}

export function renderOverviewTab(vm: TabVm): string {
  return `
    <section class="tab-section">
      <p class="overview-description">${escapeHtml(vm.plan.descriptor)}</p>
    </section>
    <section class="tab-section">
      <h2>Which release we're in</h2>
      ${renderCurrentRelease(vm)}
    </section>
    <section class="tab-section">
      <h2>How far along</h2>
      ${renderTotals(vm)}
    </section>
    <section class="tab-section">
      <h2>What's live and what's not</h2>
      <ul class="live-indicator-list">
        ${getLiveIndicators(vm.plan.derived.systems, vm.nowIso).map(renderLiveIndicator).join('')}
      </ul>
      <a class="text-link" href="${tabHref('systems')}">See all systems &rarr;</a>
    </section>`;
}
