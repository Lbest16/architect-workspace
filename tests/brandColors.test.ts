import { describe, expect, it } from 'vitest';
import { brandColors } from '../src/brandColors';

describe('brandColors', () => {
  it('defines a hex value for every token used across the Command Center', () => {
    for (const value of Object.values(brandColors)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
