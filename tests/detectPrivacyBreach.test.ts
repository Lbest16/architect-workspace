import { describe, expect, it } from 'vitest';
import { detectPrivacyBreach } from '../src/detectPrivacyBreach';
import type { ClientProfile } from '../src/clientProfile';

const fictionalClient: ClientProfile = {
  id: 'CLT-88213',
  name: 'Isabelle Rourke',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [
    { productId: 'PRD-0900', category: 'Accessories', house: 'Chanel', priceUsd: 590, purchasedOn: '2025-11-02' },
  ],
  lastContactedOn: '2026-05-02',
};

describe('detectPrivacyBreach', () => {
  it('passes fictional sample data', () => {
    expect(detectPrivacyBreach(fictionalClient)).toEqual({ ok: true });
  });

  it('flags a client id outside the fictional id pattern', () => {
    const result = detectPrivacyBreach({ ...fictionalClient, id: 'real-customer-42' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('id');
  });

  it('flags a name field containing an email address', () => {
    const result = detectPrivacyBreach({ ...fictionalClient, name: 'jane.doe@example.com' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('email');
  });

  it('flags a field containing a Social Security Number', () => {
    const result = detectPrivacyBreach({ ...fictionalClient, name: '123-45-6789' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('Social Security');
  });

  it('flags a field containing a phone number', () => {
    const result = detectPrivacyBreach({ ...fictionalClient, name: '555-123-4567' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('phone');
  });
});
