import { describe, expect, it } from 'vitest';
import { renderClientRoster } from '../src/renderClientRoster';
import type { ClientProfile } from '../src/clientProfile';

const client: ClientProfile = {
  id: 'CLT-1',
  name: 'Test <Client>',
  preferences: { preferredCategories: [], preferredHouses: [] },
  purchaseHistory: [],
  lastContactedOn: '2026-01-01',
};

describe('renderClientRoster', () => {
  it('lists each client with an escaped name and id', () => {
    const html = renderClientRoster([client]);
    expect(html).toContain('Test &lt;Client&gt;');
    expect(html).toContain('CLT-1');
  });

  it('shows an empty state when there are no clients', () => {
    expect(renderClientRoster([])).toContain('No clients');
  });

  it('throws when given non-array data, so the caller can show a fallback UI', () => {
    expect(() => renderClientRoster(null as unknown as ClientProfile[])).toThrow();
  });
});
