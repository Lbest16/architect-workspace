import { describe, expect, it } from 'vitest';
import { getLiveIndicators } from '../src/liveStatus';

describe('getLiveIndicators', () => {
  it('always marks the Command Center itself as live, since it is running if you can see it', () => {
    const [first] = getLiveIndicators([], '2026-08-27T12:00:00.000Z');
    expect(first).toEqual({
      id: 'command-center',
      label: 'Command Center (this page)',
      status: 'live',
      lastCheckedIso: '2026-08-27T12:00:00.000Z',
    });
  });

  it('renders every named system as unknown rather than claiming a connection nothing can verify', () => {
    const indicators = getLiveIndicators(['Client CRM', 'Product Catalog'], '2026-08-27T12:00:00.000Z');
    expect(indicators).toHaveLength(3);
    expect(indicators[1]).toEqual({ id: 'system-0', label: 'Client CRM', status: 'unknown', lastCheckedIso: null });
    expect(indicators[2].status).toBe('unknown');
  });

  it('returns just the Command Center when the plan names no external systems', () => {
    const indicators = getLiveIndicators([], '2026-08-27T12:00:00.000Z');
    expect(indicators).toHaveLength(1);
  });
});
