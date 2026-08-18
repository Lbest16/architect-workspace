import { projectMeta } from './projectMeta';
import { releases } from './releases';
import { getCurrentRelease } from './currentRelease';
import { getStoredMode, setStoredMode, type DataMode } from './dataMode';
import { getOverviewLiveIndicators } from './liveStatus';
import { renderOverview } from './renderOverview';
import { applyBrandColors } from './applyBrandColors';
import { brandColors } from './brandColors';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function renderApp(root: HTMLElement, mode: DataMode): void {
  const todayIso = todayIsoDate();
  const nowIso = new Date().toISOString();

  root.innerHTML = renderOverview({
    meta: projectMeta,
    releases,
    currentRelease: getCurrentRelease(releases, todayIso),
    todayIso,
    mode,
    liveIndicators: getOverviewLiveIndicators(nowIso),
  });

  root.querySelectorAll<HTMLButtonElement>('[data-mode-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.modeOption as DataMode;
      setStoredMode(window.localStorage, next);
      renderApp(root, next);
    });
  });
}

export function init(): void {
  applyBrandColors(document.documentElement, brandColors);
  const root = document.getElementById('app');
  if (!root) return;
  renderApp(root, getStoredMode(window.localStorage));
}

if (typeof document !== 'undefined') {
  init();
}
