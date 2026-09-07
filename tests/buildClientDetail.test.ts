import { beforeEach, describe, expect, it } from 'vitest';
import { buildClientDetail } from '../src/buildClientDetail';
import { clearClientDataAccessLog, getClientDataAccessLog } from '../src/logClientDataAccess';
import { clearSecurityAlertLog, getSecurityAlertLog } from '../src/logSecurityAlert';
import type { ClientProfile } from '../src/clientProfile';
import type { Product } from '../src/product';

beforeEach(() => {
  clearClientDataAccessLog();
  clearSecurityAlertLog();
});

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

  it('records an audit log entry every time client data is processed', () => {
    buildClientDetail(client, catalog, now);

    const log = getClientDataAccessLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].outcome).toBe('allowed');
  });

  it('blocks processing and alerts security when the client data fails the privacy check', () => {
    const suspectClient: ClientProfile = { ...client, id: 'not-a-fictional-id' };

    const html = buildClientDetail(suspectClient, catalog, now);

    expect(html).toContain('Access blocked');
    expect(html).not.toContain('<textarea');

    const accessLog = getClientDataAccessLog();
    expect(accessLog).toHaveLength(1);
    expect(accessLog[0].outcome).toBe('blocked');

    const alertLog = getSecurityAlertLog();
    expect(alertLog).toHaveLength(1);
    expect(alertLog[0].clientId).toBe('not-a-fictional-id');
  });
});
