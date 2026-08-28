import type { DataMode } from './dataMode';

export function renderSampleBanner(mode: DataMode): string {
  if (mode !== 'sample') return '';
  return `
    <p class="sample-banner">
      <span class="sample-tag">SAMPLE</span>
      This tab is showing made-up sample data so you can see the shape of it. Switch to Real to see what the project has actually produced.
    </p>`;
}
