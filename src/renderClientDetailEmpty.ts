import { escapeHtml } from './escapeHtml';

/** Generic empty-state panel for the client detail view (client not found, no opportunity, etc). */
export function renderClientDetailEmpty(heading: string, message: string): string {
  return `
    <div class="client-detail client-detail--empty">
      <p><a href="#/clients">&larr; Back to clients</a></p>
      <h2>${escapeHtml(heading)}</h2>
      <p>${escapeHtml(message)}</p>
    </div>`;
}
