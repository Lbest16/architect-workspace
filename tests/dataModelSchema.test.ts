import { describe, expect, it } from 'vitest';
import { dataModelEntities } from '../src/dataModelSchema';

describe('dataModelEntities', () => {
  it('names every entity after a domain concept, never a vendor', () => {
    const vendorNames = ['helloSign', 'stripe', 'salesforce', 'shopify'];
    for (const entity of dataModelEntities) {
      expect(vendorNames.some((v) => entity.name.toLowerCase().includes(v))).toBe(false);
    }
  });

  it('traces every entity back to at least one requirement id', () => {
    for (const entity of dataModelEntities) {
      expect(entity.requirementIds.length).toBeGreaterThan(0);
    }
  });

  it('gives every entity at least one field and one relationship', () => {
    for (const entity of dataModelEntities) {
      expect(entity.fields.length).toBeGreaterThan(0);
      expect(entity.relationships.length).toBeGreaterThan(0);
    }
  });

  it('has unique entity names', () => {
    const names = dataModelEntities.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
