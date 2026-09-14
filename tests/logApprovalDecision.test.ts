import { beforeEach, describe, expect, it } from 'vitest';
import { clearApprovalAuditLog, getApprovalAuditLog, logApprovalDecision } from '../src/logApprovalDecision';

describe('logApprovalDecision', () => {
  beforeEach(() => {
    clearApprovalAuditLog();
  });

  it('records the decision and the approver', () => {
    logApprovalDecision({
      draftId: 'CLT-1:2026-01-01T00:00:00.000Z',
      decision: 'approved',
      approverId: 'advisor-1',
      decidedAt: '2026-01-01T00:05:00.000Z',
    });

    const log = getApprovalAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].decision).toBe('approved');
    expect(log[0].approverId).toBe('advisor-1');
  });

  it('is append-only — multiple decisions all stay in the log', () => {
    logApprovalDecision({
      draftId: 'CLT-1:2026-01-01T00:00:00.000Z',
      decision: 'approved',
      approverId: 'advisor-1',
      decidedAt: '2026-01-01T00:05:00.000Z',
    });
    logApprovalDecision({
      draftId: 'CLT-2:2026-01-01T00:01:00.000Z',
      decision: 'rejected',
      approverId: 'advisor-2',
      decidedAt: '2026-01-01T00:06:00.000Z',
    });

    expect(getApprovalAuditLog()).toHaveLength(2);
  });
});
