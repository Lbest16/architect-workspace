import { describe, expect, it } from 'vitest';
import { releases } from '../src/releases';

describe('releases', () => {
  it('has all five programme releases in order', () => {
    expect(releases.map((r) => r.id)).toEqual(['r0', 'r1', 'r2', 'r3', 'r4']);
  });

  it('gives every release a positive story count and a valid date range', () => {
    for (const release of releases) {
      expect(release.storyCount).toBeGreaterThan(0);
      expect(release.startIso <= release.endIso).toBe(true);
    }
  });
});
