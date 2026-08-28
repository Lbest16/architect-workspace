import type { Plan } from './loadPlan';
import type { DataMode } from './dataMode';
import type { DataAge } from './dataAge';
import type { TabId } from './route';
import { renderModeSwitch } from './renderModeSwitch';
import { renderSampleBanner } from './renderSampleBanner';
import { renderDataAgeBanner } from './dataAgeBanner';
import { renderTabNav } from './renderTabNav';
import { escapeHtml } from './escapeHtml';

export interface ShellVm {
  plan: Plan | null;
  mode: DataMode;
  dataAge: DataAge | null;
  activeTab: TabId;
}

export function renderShell(vm: ShellVm): string {
  const name = vm.plan?.project?.name ?? 'Command Center';

  return `
    <header class="app-header">
      <h1>${escapeHtml(name)}</h1>
      <p class="app-header__tagline">Command Center</p>
      ${renderModeSwitch(vm.mode)}
    </header>
    ${renderSampleBanner(vm.mode)}
    ${renderDataAgeBanner(vm.dataAge)}
    ${renderTabNav(vm.activeTab)}`;
}
