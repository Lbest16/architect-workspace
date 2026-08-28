import { describe, expect, it } from 'vitest';
import type { ClientPreferences, ClientProfile, Purchase } from '../src/clientProfile';

describe('ClientProfile shape', () => {
  it('accepts a fully-formed client profile', () => {
    const purchase: Purchase = {
      productId: 'PRD-1',
      category: 'Handbags',
      house: 'Chanel',
      priceUsd: 100,
      purchasedOn: '2026-01-01',
    };
    const preferences: ClientPreferences = { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] };
    const client: ClientProfile = {
      id: 'CLT-1',
      name: 'Test Client',
      preferences,
      purchaseHistory: [purchase],
      lastContactedOn: '2026-01-01',
    };

    expect(client.purchaseHistory).toHaveLength(1);
    expect(client.preferences.preferredHouses).toContain('Chanel');
  });
});
