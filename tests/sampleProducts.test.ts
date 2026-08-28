import { describe, expect, it } from 'vitest';
import { sampleProducts } from '../src/sampleProducts';

describe('sampleProducts', () => {
  it('is a non-empty fictional catalog with unique ids', () => {
    expect(sampleProducts.length).toBeGreaterThan(0);
    const ids = sampleProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every product has a positive price and non-empty category/house', () => {
    for (const product of sampleProducts) {
      expect(product.priceUsd).toBeGreaterThan(0);
      expect(product.category.length).toBeGreaterThan(0);
      expect(product.house.length).toBeGreaterThan(0);
    }
  });
});
