import { beforeEach, describe, expect, it } from 'vitest';
import { generateMessage } from '../src/generateMessage';
import { clearMessageAuditLog, getMessageAuditLog } from '../src/logMessageGeneration';
import type { ClientProfile } from '../src/clientProfile';
import type { Opportunity } from '../src/opportunity';
import type { Product } from '../src/product';

beforeEach(() => clearMessageAuditLog());

const now = new Date('2026-08-30');

const client: ClientProfile = {
  id: 'CLT-1',
  name: 'Isabelle Rourke',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [{ productId: 'PRD-OLD', category: 'Accessories', house: 'Chanel', priceUsd: 500, purchasedOn: '2026-01-01' }],
  lastContactedOn: '2026-08-20',
};

const catalog: Product[] = [
  { id: 'PRD-MATCH', name: 'Quilted Bag', category: 'Handbags', house: 'Chanel', priceUsd: 800, isNewArrival: true },
];

describe('generateMessage — AC1: personalized and editable', () => {
  it('fills the new_arrival_match template with client and product details', () => {
    const opportunity: Opportunity = {
      clientId: 'CLT-1',
      type: 'new_arrival_match',
      productId: 'PRD-MATCH',
      headline: 'Quilted Bag (Chanel) for Isabelle Rourke',
      score: 85,
    };

    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.message.subject).toContain('Isabelle Rourke');
    expect(result.message.body).toContain('Isabelle Rourke');
    expect(result.message.body).toContain('Quilted Bag');
    expect(result.message.body).toContain('Chanel');
    expect(result.message.body).not.toMatch(/\{\{.*\}\}/);
    expect(result.message.characterCount).toBe(result.message.body.length);
    expect(result.message.productId).toBe('PRD-MATCH');
  });

  it('generates a re_engagement message with no linked product', () => {
    const opportunity: Opportunity = {
      clientId: 'CLT-1',
      type: 're_engagement',
      productId: null,
      headline: 'Re-engage Isabelle Rourke',
      score: 90,
    };

    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.message.productId).toBeNull();
    expect(result.message.body).toContain('Isabelle Rourke');
    expect(result.message.body).not.toMatch(/\{\{.*\}\}/);
  });

  it('returns a message a caller can freely edit (a plain mutable string field)', () => {
    const opportunity: Opportunity = {
      clientId: 'CLT-1',
      type: 're_engagement',
      productId: null,
      headline: 'Re-engage Isabelle Rourke',
      score: 90,
    };

    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    result.message.body = 'Edited by the advisor.';
    expect(result.message.body).toBe('Edited by the advisor.');
  });
});

describe('generateMessage — AC2: invalid opportunity produces a meaningful error', () => {
  it('rejects a missing opportunity', () => {
    const result = generateMessage(undefined as unknown as Opportunity, client, catalog, now);
    expect(result.ok).toBe(false);
  });

  it('rejects an opportunity for a different client', () => {
    const opportunity: Opportunity = {
      clientId: 'CLT-999',
      type: 're_engagement',
      productId: null,
      headline: 'irrelevant',
      score: 1,
    };
    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/CLT-999/);
  });

  it('rejects an unrecognized opportunity type', () => {
    const opportunity = {
      clientId: 'CLT-1',
      type: 'not_a_real_type',
      productId: null,
      headline: 'irrelevant',
      score: 1,
    } as unknown as Opportunity;
    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/not_a_real_type/);
  });

  it('rejects a product-requiring opportunity whose product is not in the catalog', () => {
    const opportunity: Opportunity = {
      clientId: 'CLT-1',
      type: 'new_arrival_match',
      productId: 'PRD-MISSING',
      headline: 'irrelevant',
      score: 1,
    };
    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/PRD-MISSING/);
  });
});

describe('generateMessage — AC3: logs every generated message for audit', () => {
  it('appends an audit entry matching the returned message on success', () => {
    const opportunity: Opportunity = {
      clientId: 'CLT-1',
      type: 're_engagement',
      productId: null,
      headline: 'Re-engage Isabelle Rourke',
      score: 90,
    };

    const result = generateMessage(opportunity, client, catalog, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const log = getMessageAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].message).toEqual(result.message);
  });

  it('does not log anything when generation fails', () => {
    generateMessage(undefined as unknown as Opportunity, client, catalog, now);
    expect(getMessageAuditLog()).toHaveLength(0);
  });
});
