import { beforeEach, describe, expect, it } from 'vitest';
import { clearOpportunityAuditLog, getOpportunityAuditLog, logOpportunityReasoning } from '../src/logOpportunityReasoning';

beforeEach(() => clearOpportunityAuditLog());

describe('logOpportunityReasoning', () => {
  it('starts empty', () => {
    expect(getOpportunityAuditLog()).toHaveLength(0);
  });

  it('records an entry with its reasoning', () => {
    logOpportunityReasoning({
      clientId: 'CLT-1',
      loggedAt: '2026-08-27T00:00:00.000Z',
      opportunity: { clientId: 'CLT-1', type: 're_engagement', productId: null, headline: 'Re-engage', score: 90 },
      reasoning: [{ factor: 'contact_gap', detail: '90 days since last contact.', weight: 90 }],
    });

    const log = getOpportunityAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].reasoning[0].factor).toBe('contact_gap');
  });

  it('accumulates one entry per call', () => {
    logOpportunityReasoning({
      clientId: 'A',
      loggedAt: 't',
      opportunity: { clientId: 'A', type: 're_engagement', productId: null, headline: 'h', score: 1 },
      reasoning: [],
    });
    logOpportunityReasoning({
      clientId: 'B',
      loggedAt: 't',
      opportunity: { clientId: 'B', type: 're_engagement', productId: null, headline: 'h', score: 1 },
      reasoning: [],
    });

    expect(getOpportunityAuditLog()).toHaveLength(2);
  });

  it('clears the log', () => {
    logOpportunityReasoning({
      clientId: 'A',
      loggedAt: 't',
      opportunity: { clientId: 'A', type: 're_engagement', productId: null, headline: 'h', score: 1 },
      reasoning: [],
    });
    clearOpportunityAuditLog();
    expect(getOpportunityAuditLog()).toHaveLength(0);
  });
});
