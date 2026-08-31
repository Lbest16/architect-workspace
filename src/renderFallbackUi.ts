import { escapeHtml } from './escapeHtml';

/** Renders a fallback panel shown in place of a UI component that failed to load or crashed. */
export function renderFallbackUi(message: string): string {
  return `
    <div class="advisor-fallback" role="alert">
      <h2>Something went wrong</h2>
      <p>${escapeHtml(message)}</p>
      <p class="advisor-fallback__hint">Try reloading the page. If this keeps happening, contact support.</p>
    </div>`;
}
