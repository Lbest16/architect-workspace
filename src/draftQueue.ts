import type { Draft, DraftStatus } from './draft';
import type { OutreachMessage } from './message';

const queue = new Map<string, Draft>();

function draftId(message: OutreachMessage): string {
  return `${message.clientId}:${message.generatedAt}`;
}

/**
 * Adds a draft message to the approval queue as 'pending'. Never sends anything — there is
 * no send path in this module at all, so a queued draft can only leave 'pending' via
 * decideDraft. Queuing the same message twice (e.g. a retried call) returns the existing
 * draft instead of creating a duplicate.
 */
export function queueDraft(message: OutreachMessage, now: Date = new Date()): Draft {
  const id = draftId(message);
  const existing = queue.get(id);
  if (existing) {
    return existing;
  }
  const draft: Draft = { id, message, status: 'pending', queuedAt: now.toISOString() };
  queue.set(id, draft);
  return draft;
}

export function getQueuedDrafts(): readonly Draft[] {
  return Array.from(queue.values());
}

export function getDraft(id: string): Draft | undefined {
  return queue.get(id);
}

/** The only way a queued draft's status changes — keeps decision logic out of the queue's storage. */
export function updateDraftStatus(id: string, status: DraftStatus): Draft | undefined {
  const draft = queue.get(id);
  if (!draft) {
    return undefined;
  }
  const updated: Draft = { ...draft, status };
  queue.set(id, updated);
  return updated;
}

export function clearDraftQueue(): void {
  queue.clear();
}
