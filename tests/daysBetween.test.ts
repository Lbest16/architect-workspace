import { describe, expect, it } from 'vitest';
import { daysBetween } from '../src/daysBetween';

describe('daysBetween', () => {
  it('computes whole days between two dates', () => {
    expect(daysBetween(new Date('2026-01-01'), new Date('2026-01-11'))).toBe(10);
  });

  it('returns 0 for the same date', () => {
    expect(daysBetween(new Date('2026-01-01'), new Date('2026-01-01'))).toBe(0);
  });

  it('returns a negative number when "to" precedes "from"', () => {
    expect(daysBetween(new Date('2026-01-11'), new Date('2026-01-01'))).toBe(-10);
  });
});
