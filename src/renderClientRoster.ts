import { escapeHtml } from './escapeHtml';
import { clientDetailHref } from './advisorRoute';
import type { ClientProfile } from './clientProfile';

/** Renders the advisor's client roster as a navigable list. Throws if the roster data isn't a valid array. */
export function renderClientRoster(clients: ClientProfile[]): string {
  if (!Array.isArray(clients)) {
    throw new Error('Client roster data is not available.');
  }
  if (clients.length === 0) {
    return '<p class="empty-state">No clients to show yet.</p>';
  }

  const items = clients
    .map(
      (client) => `
      <li class="client-roster__item">
        <a href="${clientDetailHref(client.id)}" class="client-roster__link">
          <span class="client-roster__name">${escapeHtml(client.name)}</span>
          <span class="client-roster__meta">${escapeHtml(client.id)} · last contacted ${escapeHtml(client.lastContactedOn)}</span>
        </a>
      </li>`,
    )
    .join('');

  return `<ul class="client-roster">${items}</ul>`;
}
