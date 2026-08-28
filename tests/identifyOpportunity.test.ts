import { beforeEach, describe, expect, it } from 'vitest';
import { identifyOpportunity } from '../src/identifyOpportunity';
import { clearOpportunityAuditLog, getOpportunityAuditLog } from '../src/logOpportunityReasoning';
import type { Product } from '../src/product';

beforeEach(() => clearOpportunityAuditLog());

const now = new Date('2026-08-27');

const catalog: Product[] = [
  { id: 'PRD-MATCH', name: 'Quilted Bag', category: 'Handbags', house: 'Chanel', priceUsd: 800, isNewArrival: true },
  { id: 'PRD-OTHER', name: 'Wool Coat', category: 'Outerwear', house: 'Loro Piana', priceUsd: 4000, isNewArrival: false },
];

const validClient = {
  id: 'CLT-1',
  name: 'Isabelle Rourke',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [{ productId: 'PRD-OLD', category: 'Accessories', house: 'Chanel', priceUsd: 500, purchasedOn: '2026-01-01' }],
  lastContactedOn: '2026-08-20',
};

describe('identifyOpportunity — AC1: identifies the strongest opportunity from profile, purchase history, and preferences', () => {
  it('returns the single highest-scoring opportunity along with its reasoning', () => {
    const result = identifyOpportunity(validClient, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.opportunity.clientId).toBe('CLT-1');
    expect(result.opportunity.productId).toBe('PRD-MATCH');
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same inputs', () => {
    const first = identifyOpportunity(validClient, catalog, now);
    const second = identifyOpportunity(validClient, catalog, now);
    expect(first).toEqual(second);
  });
});

describe('identifyOpportunity — AC2: incomplete client data produces a meaningful error', () => {
  it('rejects a client missing purchase history, naming the missing field', () => {
    const { purchaseHistory, ...incomplete } = validClient;
    const result = identifyOpportunity(incomplete, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/purchaseHistory/);
  });

  it('rejects a client with an invalid purchase history entry', () => {
    const invalid = { ...validClient, purchaseHistory: [{ productId: 'PRD-1' }] };
    const result = identifyOpportunity(invalid, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('rejects entirely missing client data', () => {
    const result = identifyOpportunity(undefined, catalog, now);
    expect(result.ok).toBe(false);
  });
});

describe('identifyOpportunity — AC3: logs the reasoning for each opportunity identified', () => {
  it('appends an audit entry whose reasoning matches what was returned to the caller', () => {
    const result = identifyOpportunity(validClient, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const log = getOpportunityAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].reasoning).toEqual(result.reasoning);
    expect(log[0].opportunity).toEqual(result.opportunity);
  });

  it('does not log anything when identification fails', () => {
    identifyOpportunity(undefined, catalog, now);
    expect(getOpportunityAuditLog()).toHaveLength(0);
  });
});
