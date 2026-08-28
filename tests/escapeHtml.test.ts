import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../src/escapeHtml';

describe('escapeHtml', () => {
  it('escapes ampersands and angle brackets', () => {
    expect(escapeHtml('<script>alert(1)</script> & co')).toBe('&lt;script&gt;alert(1)&lt;/script&gt; &amp; co');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Luxury Client Intelligence Agent')).toBe('Luxury Client Intelligence Agent');
  });
});
