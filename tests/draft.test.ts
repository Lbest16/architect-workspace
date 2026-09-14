import { describe, expect, it } from 'vitest';
import type { Draft, DraftStatus } from '../src/draft';
import type { OutreachMessage } from '../src/message';

describe('Draft shape', () => {
  const message: OutreachMessage = {
    clientId: 'CLT-1',
    opportunityType: 'new_arrival_match',
    productId: 'PRD-1',
    subject: 'Test subject',
    body: 'Test body',
    characterCount: 9,
    generatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('accepts a fully-formed pending draft', () => {
    const draft: Draft = {
      id: 'DRAFT-1',
      message,
      status: 'pending',
      queuedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(draft.status).toBe('pending');
    expect(draft.message.clientId).toBe('CLT-1');
  });

  it('supports all draft statuses', () => {
    const statuses: DraftStatus[] = ['pending', 'approved', 'rejected'];

    for (const status of statuses) {
      const draft: Draft = { id: 'DRAFT-1', message, status, queuedAt: '2026-01-01T00:00:00.000Z' };
      expect(draft.status).toBe(status);
    }
  });
});
