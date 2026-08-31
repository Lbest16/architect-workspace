import { describe, expect, it } from 'vitest';
import type { ProductRecommendation, ProductRecommendationResult } from '../src/productRecommendation';

describe('ProductRecommendation shape', () => {
  it('accepts a fully-formed recommendation', () => {
    const recommendation: ProductRecommendation = {
      clientId: 'CLT-1',
      opportunityType: 'new_arrival_match',
      productId: 'PRD-1',
      productName: 'Quilted Flap Bag',
      score: 85,
    };

    expect(recommendation.productId).toBe('PRD-1');
    expect(recommendation.score).toBe(85);
  });

  it('supports both ok and error result variants', () => {
    const ok: ProductRecommendationResult = {
      ok: true,
      recommendation: {
        clientId: 'CLT-1',
        opportunityType: 're_engagement',
        productId: 'PRD-9',
        productName: 'Silk Twill Scarf',
        score: 40,
      },
      reasoning: [{ factor: 'house_match', detail: 'Matches preferred house.', weight: 40 }],
    };
    const failed: ProductRecommendationResult = { ok: false, error: 'catalog not loaded' };

    expect(ok.ok).toBe(true);
    expect(failed.ok).toBe(false);
  });
});
