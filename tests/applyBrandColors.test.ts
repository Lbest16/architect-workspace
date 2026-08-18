import { describe, expect, it, vi } from 'vitest';
import { applyBrandColors, type StyleTarget } from '../src/applyBrandColors';
import { brandColors } from '../src/brandColors';

describe('applyBrandColors', () => {
  it('writes one CSS custom property per brand color token', () => {
    const setProperty = vi.fn();
    const target: StyleTarget = { style: { setProperty } };

    applyBrandColors(target, brandColors);

    expect(setProperty).toHaveBeenCalledTimes(Object.keys(brandColors).length);
    expect(setProperty).toHaveBeenCalledWith('--status-live', brandColors.statusLive);
    expect(setProperty).toHaveBeenCalledWith('--sample-tag', brandColors.sampleTag);
  });
});
