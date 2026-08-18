import { describe, expect, it } from 'vitest';
import { getCurrentRelease } from '../src/currentRelease';
import { releases } from '../src/releases';

describe('getCurrentRelease', () => {
  it('returns the release whose date window contains today', () => {
    expect(getCurrentRelease(releases, '2026-08-17')?.id).toBe('r0');
  });

  it('returns the nearest upcoming release before the programme starts', () => {
    expect(getCurrentRelease(releases, '2026-08-01')?.id).toBe('r0');
  });

  it('returns the last release once the programme has ended', () => {
    expect(getCurrentRelease(releases, '2026-12-01')?.id).toBe('r4');
  });

  it('returns null when there are no releases at all', () => {
    expect(getCurrentRelease([], '2026-08-17')).toBeNull();
  });
});
