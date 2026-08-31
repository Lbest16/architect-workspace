import { describe, expect, it } from 'vitest';
import { renderFallbackUi } from '../src/renderFallbackUi';

describe('renderFallbackUi', () => {
  it('shows the error message and a recovery hint', () => {
    const html = renderFallbackUi('boom');
    expect(html).toContain('Something went wrong');
    expect(html).toContain('boom');
  });

  it('escapes the message to avoid injecting markup', () => {
    const html = renderFallbackUi('<script>x</script>');
    expect(html).not.toContain('<script>x</script>');
  });
});
