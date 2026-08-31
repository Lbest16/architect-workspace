import { describe, expect, it } from 'vitest';
import { buildAdvisorPage } from '../src/buildAdvisorPage';
import type { AdvisorRoute } from '../src/advisorRoute';
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

const roster: AdvisorRoute = { view: 'roster' };

describe('buildAdvisorPage', () => {
  it('renders the shell with the client roster for the roster route', () => {
    const html = buildAdvisorPage(roster, [client], catalog, now);
    expect(html).toContain('Client Intelligence');
    expect(html).toContain('Isabelle Rourke');
  });

  it('renders the client detail view for a client-detail route', () => {
    const html = buildAdvisorPage({ view: 'client-detail', clientId: 'CLT-1' }, [client], catalog, now);
    expect(html).toContain('Isabelle Rourke');
    expect(html).toContain('<textarea');
  });

  it('shows a not-found empty state for an unknown client id', () => {
    const html = buildAdvisorPage({ view: 'client-detail', clientId: 'CLT-404' }, [client], catalog, now);
    expect(html).toContain('Client not found');
  });

  it('renders a fallback UI instead of crashing when a component fails', () => {
    const html = buildAdvisorPage(roster, null as unknown as ClientProfile[], catalog, now);
    expect(html).toContain('Something went wrong');
  });
});
