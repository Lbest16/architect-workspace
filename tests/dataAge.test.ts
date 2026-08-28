import { describe, expect, it } from 'vitest';
import { getDataAge } from '../src/dataAge';

describe('getDataAge', () => {
  it('reports today for data generated the same day', () => {
    const age = getDataAge('2026-08-24T15:39:21.818Z', '2026-08-24T16:00:00.000Z');
    expect(age?.ageDays).toBe(0);
    expect(age?.isStale).toBe(false);
    expect(age?.relativeLabel).toBe('today');
    expect(age?.label).toContain('Data as of');
    expect(age?.label).toContain('24 August 2026');
  });

  it('is not stale just under a week old', () => {
    const age = getDataAge('2026-08-20T00:00:00.000Z', '2026-08-27T00:00:00.000Z');
    expect(age?.ageDays).toBe(7);
    expect(age?.isStale).toBe(false);
  });

  it('warns once data is more than a week old', () => {
    const age = getDataAge('2026-08-01T00:00:00.000Z', '2026-08-27T00:00:00.000Z');
    expect(age?.ageDays).toBe(26);
    expect(age?.isStale).toBe(true);
    expect(age?.relativeLabel).toBe('26 days ago');
  });

  it('returns null for an unparseable timestamp instead of guessing', () => {
    expect(getDataAge('not-a-date', '2026-08-27T00:00:00.000Z')).toBeNull();
  });
});
