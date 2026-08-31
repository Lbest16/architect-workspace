import { beforeEach, describe, expect, it } from 'vitest';
import { recommendProduct } from '../src/recommendProduct';
import { clearProductRecommendationAuditLog, getProductRecommendationAuditLog } from '../src/logProductRecommendation';
import type { ClientProfile } from '../src/clientProfile';
import type { Opportunity } from '../src/opportunity';
import type { Product } from '../src/product';

beforeEach(() => clearProductRecommendationAuditLog());

const now = new Date('2026-08-30');

const client: ClientProfile = {
  id: 'CLT-1',
  name: 'Isabelle Rourke',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [{ productId: 'PRD-OLD', category: 'Accessories', house: 'Chanel', priceUsd: 500, purchasedOn: '2026-01-01' }],
  lastContactedOn: '2026-08-20',
};

const opportunity: Opportunity = {
  clientId: 'CLT-1',
  type: 're_engagement',
  productId: null,
  headline: 'Re-engage Isabelle Rourke',
  score: 90,
};

describe('recommendProduct — AC1: recommends a product relevant to the client preferences', () => {
  it('picks the catalog product that best matches preferred category and house', () => {
    const catalog: Product[] = [
      { id: 'PRD-MATCH', name: 'Quilted Flap Bag', category: 'Handbags', house: 'Chanel', priceUsd: 8800, isNewArrival: true },
      { id: 'PRD-OTHER', name: 'Wool Travel Blazer', category: 'Tailoring', house: 'Brunello Cucinelli', priceUsd: 3400, isNewArrival: false },
    ];

    const result = recommendProduct(opportunity, client, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.recommendation.productId).toBe('PRD-MATCH');
    expect(result.recommendation.clientId).toBe('CLT-1');
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.reasoning.some((r) => r.factor === 'house_match')).toBe(true);
  });

  it('is deterministic for the same inputs', () => {
    const catalog: Product[] = [
      { id: 'PRD-MATCH', name: 'Quilted Flap Bag', category: 'Handbags', house: 'Chanel', priceUsd: 8800, isNewArrival: true },
    ];

    const first = recommendProduct(opportunity, client, catalog, now);
    const second = recommendProduct(opportunity, client, catalog, now);
    expect(first).toEqual(second);
  });
});

describe('recommendProduct — AC2: no available products produces a meaningful error', () => {
  it('rejects when the catalog is not loaded', () => {
    const result = recommendProduct(opportunity, client, undefined as unknown as Product[], now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/not loaded/i);
  });

  it('rejects when the catalog is empty', () => {
    const result = recommendProduct(opportunity, client, [], now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.length).toBeGreaterThan(0);
  });

  it('rejects when no catalog product matches the client preferences', () => {
    const catalog: Product[] = [
      { id: 'PRD-OTHER', name: 'Wool Travel Blazer', category: 'Tailoring', house: 'Brunello Cucinelli', priceUsd: 3400, isNewArrival: false },
    ];
    const result = recommendProduct(opportunity, client, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/CLT-1/);
  });

  it('rejects an opportunity for a different client', () => {
    const mismatched: Opportunity = { ...opportunity, clientId: 'CLT-999' };
    const catalog: Product[] = [
      { id: 'PRD-MATCH', name: 'Quilted Flap Bag', category: 'Handbags', house: 'Chanel', priceUsd: 8800, isNewArrival: true },
    ];
    const result = recommendProduct(mismatched, client, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/CLT-999/);
  });
});

describe('recommendProduct — AC3: logs the reasoning for each recommendation', () => {
  it('appends an audit entry whose reasoning matches what was returned to the caller', () => {
    const catalog: Product[] = [
      { id: 'PRD-MATCH', name: 'Quilted Flap Bag', category: 'Handbags', house: 'Chanel', priceUsd: 8800, isNewArrival: true },
    ];

    const result = recommendProduct(opportunity, client, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const log = getProductRecommendationAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].reasoning).toEqual(result.reasoning);
    expect(log[0].recommendation).toEqual(result.recommendation);
  });

  it('does not log anything when recommendation fails', () => {
    recommendProduct(opportunity, client, [], now);
    expect(getProductRecommendationAuditLog()).toHaveLength(0);
  });
});
