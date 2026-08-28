import { describe, expect, it } from 'vitest';
import { parseRoute, tabHref, detailHref, TAB_IDS } from '../src/route';

describe('parseRoute', () => {
  it('defaults to the overview tab with no detail for an empty hash', () => {
    expect(parseRoute('')).toEqual({ tab: 'overview', detail: null });
    expect(parseRoute('#')).toEqual({ tab: 'overview', detail: null });
  });

  it('parses a bare tab hash', () => {
    expect(parseRoute('#outcomes')).toEqual({ tab: 'outcomes', detail: null });
  });

  it('parses a tab plus a drill-down detail segment', () => {
    expect(parseRoute('#guardrails/REQ-007')).toEqual({ tab: 'guardrails', detail: 'REQ-007' });
  });

  it('falls back to overview for an unknown tab id rather than 404ing', () => {
    expect(parseRoute('#not-a-real-tab')).toEqual({ tab: 'overview', detail: null });
  });

  it('decodes an encoded detail segment', () => {
    expect(parseRoute('#users/luxury%20retail%20advisor')).toEqual({ tab: 'users', detail: 'luxury retail advisor' });
  });

  it('covers every declared tab id round-trip through tabHref', () => {
    for (const tab of TAB_IDS) {
      expect(parseRoute(tabHref(tab))).toEqual({ tab, detail: null });
    }
  });
});

describe('detailHref', () => {
  it('builds an encoded drill-down link', () => {
    expect(detailHref('users', 'luxury retail advisor')).toBe('#users/luxury%20retail%20advisor');
  });
});
