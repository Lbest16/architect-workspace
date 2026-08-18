import type { ProjectMeta } from './projectMeta';
import type { Release } from './releases';
import type { DataMode } from './dataMode';
import type { LiveIndicator } from './liveStatus';

export interface OverviewViewModel {
  meta: ProjectMeta;
  releases: Release[];
  currentRelease: Release | null;
  todayIso: string;
  mode: DataMode;
  liveIndicators: LiveIndicator[];
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00Z`).getTime();
  const end = new Date(`${endIso}T00:00:00Z`).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function renderModeSwitch(mode: DataMode): string {
  return `
    <div class="mode-switch" role="group" aria-label="Sample or real data">
      <button type="button" data-mode-option="real" class="mode-switch__option${mode === 'real' ? ' mode-switch__option--active' : ''}">Real</button>
      <button type="button" data-mode-option="sample" class="mode-switch__option${mode === 'sample' ? ' mode-switch__option--active' : ''}">Sample</button>
    </div>`;
}

function renderCurrentRelease(currentRelease: Release | null, todayIso: string): string {
  if (!currentRelease) {
    return `<p class="empty-state">No release is scheduled. Nothing to show yet.</p>`;
  }
  const inWindow = todayIso >= currentRelease.startIso && todayIso <= currentRelease.endIso;
  const totalDays = daysBetween(currentRelease.startIso, currentRelease.endIso);
  const dayLabel = inWindow
    ? `Day ${daysBetween(currentRelease.startIso, todayIso)} of ${totalDays}`
    : todayIso < currentRelease.startIso
      ? `Starts ${escapeHtml(currentRelease.startIso)}`
      : `Ended ${escapeHtml(currentRelease.endIso)}`;
  return `
    <div class="release-card">
      <div class="release-card__id">${escapeHtml(currentRelease.id)}</div>
      <div class="release-card__name">${escapeHtml(currentRelease.name)}</div>
      <div class="release-card__meta">${escapeHtml(currentRelease.startIso)} → ${escapeHtml(currentRelease.endIso)} · ${currentRelease.storyCount} ${currentRelease.storyCount === 1 ? 'story' : 'stories'} · ${escapeHtml(dayLabel)}</div>
    </div>`;
}

function renderLiveIndicator(indicator: LiveIndicator): string {
  const dotClass = indicator.status === 'live' ? 'status-dot status-dot--live' : 'status-dot status-dot--unknown';
  const checked = indicator.lastCheckedIso ? `checked ${escapeHtml(indicator.lastCheckedIso)}` : 'not yet checked';
  return `
    <li class="live-indicator">
      <span class="${dotClass}" aria-hidden="true"></span>
      <span class="live-indicator__label">${escapeHtml(indicator.label)}</span>
      <span class="live-indicator__checked">${checked}</span>
    </li>`;
}

export function renderOverview(vm: OverviewViewModel): string {
  const sampleNote =
    vm.mode === 'sample'
      ? `<p class="sample-note"><span class="sample-tag">SAMPLE</span> The Overview tab shows project facts, not client data, so switching to Sample changes nothing on this screen.</p>`
      : '';

  return `
    <header class="overview-header">
      <h1>${escapeHtml(vm.meta.name)}</h1>
      <p class="overview-header__tagline">${escapeHtml(vm.meta.tagline)}</p>
      ${renderModeSwitch(vm.mode)}
    </header>
    ${sampleNote}
    <section class="overview-section">
      <p class="overview-description">${escapeHtml(vm.meta.description)}</p>
    </section>
    <section class="overview-section">
      <h2>Which release we're in</h2>
      ${renderCurrentRelease(vm.currentRelease, vm.todayIso)}
    </section>
    <section class="overview-section">
      <h2>What's live and what's not</h2>
      <ul class="live-indicator-list">
        ${vm.liveIndicators.map(renderLiveIndicator).join('')}
      </ul>
    </section>
    <footer class="overview-footer">
      <span>Build ends ${escapeHtml(vm.meta.buildEndIso)}</span>
      <span>Demo day ${escapeHtml(vm.meta.demoDayIso)}</span>
    </footer>`;
}
