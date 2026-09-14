import { beforeEach, describe, expect, it } from 'vitest';
import { clearDraftQueue, getDraft, getQueuedDrafts, queueDraft, updateDraftStatus } from '../src/draftQueue';
import type { OutreachMessage } from '../src/message';

function makeMessage(overrides: Partial<OutreachMessage> = {}): OutreachMessage {
  return {
    clientId: 'CLT-1',
    opportunityType: 'new_arrival_match',
    productId: 'PRD-1',
    subject: 'Test subject',
    body: 'Test body',
    characterCount: 9,
    generatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('queueDraft', () => {
  beforeEach(() => {
    clearDraftQueue();
  });

  it('adds a created draft to the approval queue as pending', () => {
    const draft = queueDraft(makeMessage());

    expect(draft.status).toBe('pending');
    expect(getQueuedDrafts()).toHaveLength(1);
    expect(getQueuedDrafts()[0].message.clientId).toBe('CLT-1');
  });

  it('does not lose a queued draft — it stays retrievable by id', () => {
    const draft = queueDraft(makeMessage());

    expect(getDraft(draft.id)).toEqual(draft);
  });

  it('keeps multiple distinct drafts in the queue', () => {
    queueDraft(makeMessage({ clientId: 'CLT-1', generatedAt: '2026-01-01T00:00:00.000Z' }));
    queueDraft(makeMessage({ clientId: 'CLT-2', generatedAt: '2026-01-01T00:01:00.000Z' }));

    expect(getQueuedDrafts()).toHaveLength(2);
  });

  it('is idempotent — re-queuing the same message does not duplicate it', () => {
    const message = makeMessage();
    const first = queueDraft(message);
    const second = queueDraft(message);

    expect(second).toEqual(first);
    expect(getQueuedDrafts()).toHaveLength(1);
  });

  it('never produces a status other than pending, approved, or rejected — there is no sent state', () => {
    const draft = queueDraft(makeMessage());

    expect(['pending', 'approved', 'rejected']).toContain(draft.status);
  });
});

describe('updateDraftStatus', () => {
  beforeEach(() => {
    clearDraftQueue();
  });

  it('changes the status of a queued draft', () => {
    const draft = queueDraft(makeMessage());

    const updated = updateDraftStatus(draft.id, 'approved');

    expect(updated?.status).toBe('approved');
    expect(getDraft(draft.id)?.status).toBe('approved');
  });

  it('returns undefined for a draft that is not in the queue', () => {
    expect(updateDraftStatus('missing-id', 'approved')).toBeUndefined();
  });
});
