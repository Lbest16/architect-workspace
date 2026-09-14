import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decideDraft } from '../src/decideDraft';
import { clearDraftQueue, getDraft, queueDraft } from '../src/draftQueue';
import { clearApprovalAuditLog, getApprovalAuditLog } from '../src/logApprovalDecision';
import * as approvalLog from '../src/logApprovalDecision';
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

describe('decideDraft', () => {
  beforeEach(() => {
    clearDraftQueue();
    clearApprovalAuditLog();
    vi.restoreAllMocks();
  });

  it('approves a pending draft and records the decision and approver in the audit log', () => {
    const draft = queueDraft(makeMessage());

    const result = decideDraft(draft.id, 'approved', 'advisor-1');

    expect(result.ok).toBe(true);
    expect(result.ok && result.draft.status).toBe('approved');
    expect(getApprovalAuditLog()).toEqual([
      expect.objectContaining({ draftId: draft.id, decision: 'approved', approverId: 'advisor-1' }),
    ]);
  });

  it('rejects a pending draft and records the decision and approver in the audit log', () => {
    const draft = queueDraft(makeMessage());

    const result = decideDraft(draft.id, 'rejected', 'advisor-2');

    expect(result.ok).toBe(true);
    expect(result.ok && result.draft.status).toBe('rejected');
    expect(getApprovalAuditLog()[0].approverId).toBe('advisor-2');
  });

  it('fails with an error when the draft is not in the queue (lost draft)', () => {
    const result = decideDraft('missing-id', 'approved', 'advisor-1');

    expect(result.ok).toBe(false);
    expect(result.ok || result.error).toMatch(/not found/);
    expect(getApprovalAuditLog()).toHaveLength(0);
  });

  it('refuses to decide an already-decided draft a second time', () => {
    const draft = queueDraft(makeMessage());
    decideDraft(draft.id, 'approved', 'advisor-1');

    const second = decideDraft(draft.id, 'rejected', 'advisor-2');

    expect(second.ok).toBe(false);
    expect(getApprovalAuditLog()).toHaveLength(1);
    expect(getDraft(draft.id)?.status).toBe('approved');
  });

  it('does not mark the draft decided when the audit log write fails', () => {
    const draft = queueDraft(makeMessage());
    vi.spyOn(approvalLog, 'logApprovalDecision').mockImplementation(() => {
      throw new Error('disk full');
    });

    const result = decideDraft(draft.id, 'approved', 'advisor-1');

    expect(result.ok).toBe(false);
    expect(result.ok || result.error).toMatch(/disk full/);
    expect(getDraft(draft.id)?.status).toBe('pending');
  });
});
