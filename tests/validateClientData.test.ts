import { describe, expect, it } from 'vitest';
import { validateClientData } from '../src/validateClientData';

const validClient = {
  id: 'CLT-1',
  name: 'Test Client',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [{ productId: 'PRD-1', category: 'Handbags', house: 'Chanel', priceUsd: 500, purchasedOn: '2026-01-01' }],
  lastContactedOn: '2026-01-01',
};

describe('validateClientData', () => {
  it('accepts a fully-formed client profile', () => {
    const result = validateClientData(validClient);
    expect(result.ok).toBe(true);
  });

  it('rejects a non-object input', () => {
    const result = validateClientData(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/must be an object/);
  });

  it('rejects undefined input', () => {
    const result = validateClientData(undefined);
    expect(result.ok).toBe(false);
  });

  it('rejects a missing id', () => {
    const { id, ...rest } = validClient;
    const result = validateClientData(rest);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/'id'/);
  });

  it('rejects missing preferences', () => {
    const { preferences, ...rest } = validClient;
    const result = validateClientData(rest);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/preferences/);
  });

  it('rejects purchaseHistory that is not an array', () => {
    const result = validateClientData({ ...validClient, purchaseHistory: 'not-an-array' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/purchaseHistory' must be an array/);
  });

  it('rejects a purchase entry with an invalid price', () => {
    const result = validateClientData({
      ...validClient,
      purchaseHistory: [{ productId: 'PRD-1', category: 'Handbags', house: 'Chanel', priceUsd: -5, purchasedOn: '2026-01-01' }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/priceUsd/);
  });

  it('rejects a purchase entry with a missing category', () => {
    const result = validateClientData({
      ...validClient,
      purchaseHistory: [{ productId: 'PRD-1', house: 'Chanel', priceUsd: 500, purchasedOn: '2026-01-01' }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/category/);
  });

  it('rejects an invalid lastContactedOn date', () => {
    const result = validateClientData({ ...validClient, lastContactedOn: 'not-a-date' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/lastContactedOn/);
  });
});
