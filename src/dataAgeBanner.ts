import type { DataAge } from './dataAge';
import { escapeHtml } from './escapeHtml';

export function renderDataAgeBanner(age: DataAge | null): string {
  if (!age) {
    return `
      <div class="data-age-banner data-age-banner--unknown" role="status">
        <span class="data-age-banner__label">Data age unknown — .colaberry/manifest.json has not loaded. Sync from the portal to refresh.</span>
      </div>`;
  }

  const staleClass = age.isStale ? ' data-age-banner--stale' : '';
  const warning = age.isStale
    ? `<span class="data-age-banner__warning">Over a week old — sync from the portal to refresh.</span>`
    : '';

  return `
    <div class="data-age-banner${staleClass}" role="status">
      <span class="data-age-banner__label">${escapeHtml(age.label)}</span>
      ${warning}
    </div>`;
}
