import { describe, expect, it } from 'vitest';
import { buildClientDetail } from '../src/buildClientDetail';
import type { ClientProfile } from '../src/clientProfile';
import type { Product } from '../src/product';

const now = new Date('2026-08-31T00:00:00.000Z');

const client: ClientProfile = {
  id: 'CLT-1',
  name: 'Isabelle Rourke',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [],
  lastContactedOn: '2026-01-01',
};

const catalog: Product[] = [
  { id: 'PRD-1002', name: 'Quilted Flap Bag', category: 'Handbags', house: 'Chanel', priceUsd: 8800, isNewArrival: true },
];

describe('buildClientDetail', () => {
  it('runs the opportunity → recommendation → message pipeline and renders the result', () => {
    const html = buildClientDetail(client, catalog, now);
    expect(html).toContain('Isabelle Rourke');
    expect(html).toContain('Quilted Flap Bag');
    expect(html).toContain('<textarea');
  });

  it('shows an informative empty state when no opportunity can be identified', () => {
    const recentlyContacted: ClientProfile = {
      ...client,
      preferences: { preferredCategories: [], preferredHouses: [] },
      lastContactedOn: '2026-08-20',
    };
    const html = buildClientDetail(recentlyContacted, [], now);
    expect(html).toContain('No opportunity identified');
  });
});
