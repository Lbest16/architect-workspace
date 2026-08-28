import { describe, expect, it } from 'vitest';
import { sampleClients } from '../src/sampleClients';
import { validateClientData } from '../src/validateClientData';

describe('sampleClients', () => {
  it('is a non-empty fictional roster with unique ids', () => {
    expect(sampleClients.length).toBeGreaterThan(0);
    const ids = sampleClients.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every sample client passes validation', () => {
    for (const client of sampleClients) {
      const result = validateClientData(client);
      expect(result.ok).toBe(true);
    }
  });

  it('uses only fictional data, never a real-looking identity field', () => {
    for (const client of sampleClients) {
      expect(client).not.toHaveProperty('ssn');
      expect(client).not.toHaveProperty('email');
      expect(client).not.toHaveProperty('phone');
    }
  });
});
