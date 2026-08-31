import { describe, expect, it } from 'vitest';
import { renderAdvisorShell } from '../src/renderAdvisorShell';

describe('renderAdvisorShell', () => {
  it('wraps the given content inside the advisor shell', () => {
    const html = renderAdvisorShell('<p>hello</p>');
    expect(html).toContain('Client Intelligence');
    expect(html).toContain('<p>hello</p>');
  });
});
