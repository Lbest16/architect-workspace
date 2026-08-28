import { describe, expect, it } from 'vitest';
import type { Product } from '../src/product';

describe('Product shape', () => {
  it('accepts a fully-formed product', () => {
    const product: Product = {
      id: 'PRD-1',
      name: 'Test Product',
      category: 'Handbags',
      house: 'Chanel',
      priceUsd: 100,
      isNewArrival: true,
    };

    expect(product.priceUsd).toBeGreaterThan(0);
    expect(product.isNewArrival).toBe(true);
  });
});
