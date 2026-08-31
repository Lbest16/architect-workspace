import { buildAdvisorPage } from './buildAdvisorPage';
import { parseAdvisorRoute } from './advisorRoute';
import type { AdvisorRoute } from './advisorRoute';
import { sampleClients } from './sampleClients';
import { sampleProducts } from './sampleProducts';
import { logAdvisorInteraction } from './logAdvisorInteraction';

function describeRoute(route: AdvisorRoute): string {
  return route.view === 'roster' ? 'roster' : `client-detail:${route.clientId}`;
}

function render(root: HTMLElement): void {
  const route = parseAdvisorRoute(window.location.hash);
  root.innerHTML = buildAdvisorPage(route, sampleClients, sampleProducts);
  logAdvisorInteraction({ type: 'navigation', detail: describeRoute(route), loggedAt: new Date().toISOString() });
}

function attachDelegatedHandlers(root: HTMLElement): void {
  root.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-queue-message]');
    if (!button) return;
    button.textContent = 'Queued for approval ✓';
    button.disabled = true;
    button.classList.add('is-queued');
    logAdvisorInteraction({
      type: 'message_queued',
      detail: 'Advisor queued the outreach message for approval.',
      loggedAt: new Date().toISOString(),
    });
  });

  root.addEventListener('change', (event) => {
    const field = (event.target as HTMLElement).closest<HTMLElement>('#message-subject, #message-body');
    if (!field) return;
    const part = field.id === 'message-subject' ? 'subject' : 'body';
    logAdvisorInteraction({
      type: 'message_edited',
      detail: `Advisor edited the message ${part}.`,
      loggedAt: new Date().toISOString(),
    });
  });
}

/** Entry point for the advisor dashboard: mounts the routed page into #app and wires navigation. */
export function initAdvisorApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  attachDelegatedHandlers(root);
  window.addEventListener('hashchange', () => render(root));
  render(root);
}

if (typeof document !== 'undefined') {
  initAdvisorApp();
}
