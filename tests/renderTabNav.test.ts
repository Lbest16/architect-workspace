import { describe, expect, it } from 'vitest';
import { renderTabNav } from '../src/renderTabNav';
import { TAB_IDS } from '../src/route';

describe('renderTabNav', () => {
  it('renders a reachable link for every declared tab', () => {
    const html = renderTabNav('overview');
    for (const tab of TAB_IDS) {
      expect(html).toContain(`href="#${tab}"`);
    }
  });

  it('marks only the active tab as current, and never disables the others', () => {
    const html = renderTabNav('outcomes');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('disabled');
    expect(html).not.toContain('aria-disabled');
  });
});
