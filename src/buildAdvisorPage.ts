import { renderAdvisorShell } from './renderAdvisorShell';
import { renderClientRoster } from './renderClientRoster';
import { renderFallbackUi } from './renderFallbackUi';
import { renderClientDetailEmpty } from './renderClientDetailEmpty';
import { buildClientDetail } from './buildClientDetail';
import type { AdvisorRoute } from './advisorRoute';
import type { ClientProfile } from './clientProfile';
import type { Product } from './product';

function buildContent(route: AdvisorRoute, clients: ClientProfile[], catalog: Product[], now: Date): string {
  if (route.view === 'roster') {
    return renderClientRoster(clients);
  }
  const client = clients.find((c) => c.id === route.clientId);
  if (!client) {
    return renderClientDetailEmpty('Client not found', `We couldn't find a client with id '${route.clientId}'.`);
  }
  return buildClientDetail(client, catalog, now);
}

/**
 * Builds the advisor dashboard's HTML for the current route. If any component fails to
 * render, returns a fallback UI instead of letting the crash propagate to the page.
 */
export function buildAdvisorPage(
  route: AdvisorRoute,
  clients: ClientProfile[],
  catalog: Product[],
  now: Date = new Date(),
): string {
  try {
    return renderAdvisorShell(buildContent(route, clients, catalog, now));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return renderFallbackUi(message);
  }
}
