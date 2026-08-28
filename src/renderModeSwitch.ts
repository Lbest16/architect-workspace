import type { DataMode } from './dataMode';

export function renderModeSwitch(mode: DataMode): string {
  return `
    <div class="mode-switch" role="group" aria-label="Sample or real data">
      <button type="button" data-mode-option="real" class="mode-switch__option${mode === 'real' ? ' mode-switch__option--active' : ''}">Real</button>
      <button type="button" data-mode-option="sample" class="mode-switch__option${mode === 'sample' ? ' mode-switch__option--active' : ''}">Sample</button>
    </div>`;
}
