import { describe, expect, it } from 'vitest';
import { renderClientDetailEmpty } from '../src/renderClientDetailEmpty';

describe('renderClientDetailEmpty', () => {
  it('shows the heading, message, and a link back to the roster', () => {
    const html = renderClientDetailEmpty('No opportunity identified', 'no catalog matches');
    expect(html).toContain('No opportunity identified');
    expect(html).toContain('no catalog matches');
    expect(html).toContain('#/clients');
  });
});
