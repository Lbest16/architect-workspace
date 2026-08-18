import { describe, expect, it } from 'vitest';
import { getOverviewLiveIndicators } from '../src/liveStatus';

describe('getOverviewLiveIndicators', () => {
  it('marks the Command Center itself as live with a real timestamp', () => {
    const [commandCenter] = getOverviewLiveIndicators('2026-08-17T12:00:00.000Z');
    expect(commandCenter.status).toBe('live');
    expect(commandCenter.lastCheckedIso).toBe('2026-08-17T12:00:00.000Z');
  });

  it('marks the product itself as unknown, not a fabricated status', () => {
    const indicators = getOverviewLiveIndicators('2026-08-17T12:00:00.000Z');
    const product = indicators.find((i) => i.id === 'clienteling-agent');
    expect(product?.status).toBe('unknown');
    expect(product?.lastCheckedIso).toBeNull();
  });
});
