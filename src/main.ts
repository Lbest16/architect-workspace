import { loadPlan, type Plan } from './loadPlan';
import { loadProgress, type Progress } from './loadProgress';
import { loadManifest, type Manifest } from './loadManifest';
import { getStoredMode, setStoredMode } from './dataMode';
import { getDataAge } from './dataAge';
import { buildSamplePlan, buildSampleProgress } from './sampleData';
import { parseRoute, detailHref, type TabId } from './route';
import { renderShell } from './renderShell';
import { applyBrandColors } from './applyBrandColors';
import { brandColors } from './brandColors';
import type { TabVm } from './tabVm';
import { renderOverviewTab } from './renderOverviewTab';
import { renderOutcomesTab } from './renderOutcomesTab';
import { renderUsersTab } from './renderUsersTab';
import { renderGuardrailsTab } from './renderGuardrailsTab';
import { renderSystemsTab } from './renderSystemsTab';
import { renderProjectManagementTab } from './renderProjectManagementTab';
import { renderAgentsTab } from './renderAgentsTab';
import { renderKnowledgeBaseTab } from './renderKnowledgeBaseTab';
import { renderDataModelTab } from './renderDataModelTab';

interface LoadedData {
  plan: Plan | null;
  progress: Progress | null;
  manifest: Manifest | null;
  error: string | null;
}

let loaded: LoadedData = { plan: null, progress: null, manifest: null, error: null };

async function loadData(): Promise<void> {
  const [planResult, progressResult, manifestResult] = await Promise.all([loadPlan(), loadProgress(), loadManifest()]);
  loaded = {
    plan: planResult.data,
    progress: progressResult.data,
    manifest: manifestResult.data,
    error: planResult.error ?? progressResult.error ?? manifestResult.error,
  };
}

function renderTab(tab: TabId, vm: TabVm): string {
  switch (tab) {
    case 'overview':
      return renderOverviewTab(vm);
    case 'outcomes':
      return renderOutcomesTab(vm);
    case 'users':
      return renderUsersTab(vm);
    case 'guardrails':
      return renderGuardrailsTab(vm);
    case 'systems':
      return renderSystemsTab(vm);
    case 'project-management':
      return renderProjectManagementTab(vm);
    case 'agents':
      return renderAgentsTab(vm);
    case 'knowledge-base':
      return renderKnowledgeBaseTab(vm);
    case 'data-model':
      return renderDataModelTab(vm);
  }
}

function renderApp(root: HTMLElement): void {
  const mode = getStoredMode(window.localStorage);
  const route = parseRoute(window.location.hash);
  const nowIso = new Date().toISOString();

  if (!loaded.plan || !loaded.progress) {
    root.innerHTML = `
      ${renderShell({ plan: null, mode, dataAge: null, activeTab: route.tab })}
      <main class="tab-content">
        <p class="empty-state">${loaded.error ? `Could not load the plan: ${loaded.error}` : 'Loading your plan…'}</p>
      </main>`;
    return;
  }

  const plan = mode === 'sample' ? buildSamplePlan(loaded.plan) : loaded.plan;
  const progress = mode === 'sample' ? buildSampleProgress(loaded.progress, plan) : loaded.progress;
  const manifest = loaded.manifest;
  const dataAge = manifest ? getDataAge(manifest.generated_at, nowIso) : null;

  const vm: TabVm = {
    plan,
    progress,
    manifest,
    mode,
    dataAge,
    todayIso: nowIso.slice(0, 10),
    nowIso,
    detail: route.detail,
  };

  root.innerHTML = `
    ${renderShell({ plan, mode, dataAge, activeTab: route.tab })}
    <main class="tab-content">${renderTab(route.tab, vm)}</main>`;
}

function attachDelegatedHandlers(root: HTMLElement): void {
  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const modeButton = target.closest<HTMLButtonElement>('[data-mode-option]');
    if (modeButton) {
      const next = modeButton.dataset.modeOption as 'real' | 'sample';
      setStoredMode(window.localStorage, next);
      renderApp(root);
    }
  });

  root.addEventListener('submit', (event) => {
    const form = (event.target as HTMLElement).closest<HTMLFormElement>('[data-kb-search-form]');
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    const query = input?.value ?? '';
    window.location.hash = detailHref('knowledge-base', 'search', query);
  });
}

export async function init(): Promise<void> {
  applyBrandColors(document.documentElement, brandColors);
  const root = document.getElementById('app');
  if (!root) return;

  attachDelegatedHandlers(root);
  window.addEventListener('hashchange', () => renderApp(root));

  renderApp(root);
  await loadData();
  renderApp(root);
}

if (typeof document !== 'undefined') {
  init();
}
