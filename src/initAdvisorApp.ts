import { buildAdvisorPage } from './buildAdvisorPage';
import { parseAdvisorRoute } from './advisorRoute';
import type { AdvisorRoute } from './advisorRoute';
import { sampleClients } from './sampleClients';
import { sampleProducts } from './sampleProducts';
import { logAdvisorInteraction } from './logAdvisorInteraction';
import { getBrowserKeyValueStore } from './browserKeyValueStore';
import { saveSessionRecord } from './saveSessionRecord';
import { loadSessionRecord } from './loadSessionRecord';
import { escapeHtml } from './escapeHtml';
import type { KeyValueStore } from './keyValueStore';

function describeRoute(route: AdvisorRoute): string {
  return route.view === 'roster' ? 'roster' : `client-detail:${route.clientId}`;
}

function draftFields(root: HTMLElement): { subject: HTMLInputElement | null; body: HTMLTextAreaElement | null; queueButton: HTMLButtonElement | null } {
  return {
    subject: root.querySelector<HTMLInputElement>('#message-subject'),
    body: root.querySelector<HTMLTextAreaElement>('#message-body'),
    queueButton: root.querySelector<HTMLButtonElement>('[data-queue-message]'),
  };
}

/** Restores a client's persisted draft/queue state into the freshly rendered detail view, if any. */
function applyPersistedSession(root: HTMLElement, route: AdvisorRoute, store: KeyValueStore | null): void {
  if (!store || route.view !== 'client-detail') return;

  const result = loadSessionRecord(store, route.clientId);
  const { subject, body, queueButton } = draftFields(root);

  if (!result.ok) {
    queueButton?.insertAdjacentHTML(
      'afterend',
      `<p class="client-detail__note" data-persistence-error>${escapeHtml(result.error)}</p>`,
    );
    return;
  }
  if (!result.record) return;

  if (subject) subject.value = result.record.subject;
  if (body) body.value = result.record.body;
  if (result.record.queued && queueButton) {
    queueButton.textContent = 'Queued for approval ✓';
    queueButton.disabled = true;
    queueButton.classList.add('is-queued');
  }
}

function persistDraft(root: HTMLElement, clientId: string, queued: boolean, store: KeyValueStore): void {
  const { subject, body } = draftFields(root);
  const result = saveSessionRecord(store, {
    clientId,
    subject: subject?.value ?? '',
    body: body?.value ?? '',
    queued,
    savedAt: new Date().toISOString(),
  });
  if (!result.ok) {
    root.querySelector('.client-detail')?.insertAdjacentHTML(
      'beforeend',
      `<p class="client-detail__note" data-persistence-error>${escapeHtml(result.error)}</p>`,
    );
  }
}

function render(root: HTMLElement, store: KeyValueStore | null): void {
  const route = parseAdvisorRoute(window.location.hash);
  root.innerHTML = buildAdvisorPage(route, sampleClients, sampleProducts);
  applyPersistedSession(root, route, store);
  logAdvisorInteraction({ type: 'navigation', detail: describeRoute(route), loggedAt: new Date().toISOString() });
}

function attachDelegatedHandlers(root: HTMLElement, store: KeyValueStore | null): void {
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

    const route = parseAdvisorRoute(window.location.hash);
    if (store && route.view === 'client-detail') {
      persistDraft(root, route.clientId, true, store);
    }
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

    const route = parseAdvisorRoute(window.location.hash);
    if (store && route.view === 'client-detail') {
      const queued = draftFields(root).queueButton?.disabled ?? false;
      persistDraft(root, route.clientId, queued, store);
    }
  });
}

/** Entry point for the advisor dashboard: mounts the routed page into #app and wires navigation. */
export function initAdvisorApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const storeResult = getBrowserKeyValueStore();
  const store = storeResult.ok ? storeResult.store : null;

  attachDelegatedHandlers(root, store);
  window.addEventListener('hashchange', () => render(root, store));
  render(root, store);
}

if (typeof document !== 'undefined') {
  initAdvisorApp();
}
