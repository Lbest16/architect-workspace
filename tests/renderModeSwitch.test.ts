import { describe, expect, it } from 'vitest';
import { renderModeSwitch } from '../src/renderModeSwitch';

describe('renderModeSwitch', () => {
  it('marks Real as active in real mode', () => {
    const html = renderModeSwitch('real');
    expect(html).toContain('data-mode-option="real" class="mode-switch__option mode-switch__option--active"');
  });

  it('marks Sample as active in sample mode', () => {
    const html = renderModeSwitch('sample');
    expect(html).toContain('data-mode-option="sample" class="mode-switch__option mode-switch__option--active"');
  });

  it('always renders both options so the switch works from either state', () => {
    const html = renderModeSwitch('real');
    expect(html).toContain('data-mode-option="real"');
    expect(html).toContain('data-mode-option="sample"');
  });
});
