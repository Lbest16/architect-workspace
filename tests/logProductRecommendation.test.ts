import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearProductRecommendationAuditLog,
  getProductRecommendationAuditLog,
  logProductRecommendation,
} from '../src/logProductRecommendation';

beforeEach(() => clearProductRecommendationAuditLog());

describe('logProductRecommendation', () => {
  it('starts empty', () => {
    expect(getProductRecommendationAuditLog()).toHaveLength(0);
  });

  it('records an entry with its reasoning', () => {
    logProductRecommendation({
      clientId: 'CLT-1',
      loggedAt: '2026-08-30T00:00:00.000Z',
      recommendation: {
        clientId: 'CLT-1',
        opportunityType: 'new_arrival_match',
        productId: 'PRD-MATCH',
        productName: 'Quilted Flap Bag',
        score: 85,
      },
      reasoning: [{ factor: 'house_match', detail: "Matches preferred house 'Chanel'.", weight: 40 }],
    });

    const log = getProductRecommendationAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].reasoning[0].factor).toBe('house_match');
  });

  it('accumulates one entry per call', () => {
    logProductRecommendation({
      clientId: 'A',
      loggedAt: 't',
      recommendation: { clientId: 'A', opportunityType: 're_engagement', productId: 'PRD-1', productName: 'p', score: 1 },
      reasoning: [],
    });
    logProductRecommendation({
      clientId: 'B',
      loggedAt: 't',
      recommendation: { clientId: 'B', opportunityType: 're_engagement', productId: 'PRD-2', productName: 'p', score: 1 },
      reasoning: [],
    });

    expect(getProductRecommendationAuditLog()).toHaveLength(2);
  });

  it('clears the log', () => {
    logProductRecommendation({
      clientId: 'A',
      loggedAt: 't',
      recommendation: { clientId: 'A', opportunityType: 're_engagement', productId: 'PRD-1', productName: 'p', score: 1 },
      reasoning: [],
    });
    clearProductRecommendationAuditLog();
    expect(getProductRecommendationAuditLog()).toHaveLength(0);
  });
});
