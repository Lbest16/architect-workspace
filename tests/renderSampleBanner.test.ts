import { describe, expect, it } from 'vitest';
import { renderSampleBanner } from '../src/renderSampleBanner';

describe('renderSampleBanner', () => {
  it('renders nothing in real mode', () => {
    expect(renderSampleBanner('real')).toBe('');
  });

  it('renders an obvious SAMPLE label in sample mode', () => {
    const html = renderSampleBanner('sample');
    expect(html).toContain('sample-tag');
    expect(html).toContain('SAMPLE');
  });
});
