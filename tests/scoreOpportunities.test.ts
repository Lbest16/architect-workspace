import { describe, expect, it } from 'vitest';
import { scoreOpportunities } from '../src/scoreOpportunities';
import type { ClientProfile } from '../src/clientProfile';
import type { Product } from '../src/product';

const now = new Date('2026-08-27');

const client: ClientProfile = {
  id: 'CLT-1',
  name: 'Test Client',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [{ productId: 'PRD-OLD', category: 'Accessories', house: 'Chanel', priceUsd: 500, purchasedOn: '2026-01-01' }],
  lastContactedOn: '2026-08-20',
};

const catalog: Product[] = [
  { id: 'PRD-MATCH', name: 'Quilted Bag', category: 'Handbags', house: 'Chanel', priceUsd: 800, isNewArrival: true },
  { id: 'PRD-NOMATCH', name: 'Wool Coat', category: 'Outerwear', house: 'Loro Piana', priceUsd: 4000, isNewArrival: false },
];

describe('scoreOpportunities', () => {
  it('only scores products matching a preferred category or house', () => {
    const candidates = scoreOpportunities(client, catalog, now);
    const productIds = candidates.map((c) => c.opportunity.productId).filter(Boolean);
    expect(productIds).toContain('PRD-MATCH');
    expect(productIds).not.toContain('PRD-NOMATCH');
  });

  it('includes reasoning entries explaining each score contribution', () => {
    const candidates = scoreOpportunities(client, catalog, now);
    const match = candidates.find((c) => c.opportunity.productId === 'PRD-MATCH')!;
    expect(match.reasoning.length).toBeGreaterThan(0);
    expect(match.reasoning.some((r) => r.factor === 'category_match')).toBe(true);
    expect(match.reasoning.some((r) => r.factor === 'house_match')).toBe(true);
  });

  it('does not surface a re-engagement candidate when contact is recent', () => {
    const candidates = scoreOpportunities(client, catalog, now);
    expect(candidates.some((c) => c.opportunity.type === 're_engagement')).toBe(false);
  });

  it('surfaces a re-engagement candidate once the contact gap passes the threshold', () => {
    const staleClient: ClientProfile = { ...client, lastContactedOn: '2026-01-01' };
    const candidates = scoreOpportunities(staleClient, catalog, now);
    const reEngagement = candidates.find((c) => c.opportunity.type === 're_engagement');
    expect(reEngagement).toBeDefined();
    expect(reEngagement?.reasoning.some((r) => r.factor === 'contact_gap')).toBe(true);
  });

  it('returns no candidates when nothing matches and contact is recent', () => {
    const pickyClient: ClientProfile = {
      ...client,
      preferences: { preferredCategories: ['Jewelry'], preferredHouses: ['Cartier'] },
    };
    expect(scoreOpportunities(pickyClient, catalog, now)).toHaveLength(0);
  });
});
