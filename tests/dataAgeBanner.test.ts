import { describe, expect, it } from 'vitest';
import { renderDataAgeBanner } from '../src/dataAgeBanner';
import { getDataAge } from '../src/dataAge';

describe('renderDataAgeBanner', () => {
  it('shows the absolute-and-relative label when age is known', () => {
    const age = getDataAge('2026-08-24T15:39:21.818Z', '2026-08-25T00:00:00.000Z');
    const html = renderDataAgeBanner(age);
    expect(html).toContain('Data as of');
    expect(html).not.toContain('data-age-banner--stale');
  });

  it('shows a warning once the data is over a week old', () => {
    const age = getDataAge('2026-08-01T00:00:00.000Z', '2026-08-27T00:00:00.000Z');
    const html = renderDataAgeBanner(age);
    expect(html).toContain('data-age-banner--stale');
    expect(html).toContain('sync from the portal to refresh');
  });

  it('shows an honest unknown state instead of a fabricated date when age is null', () => {
    const html = renderDataAgeBanner(null);
    expect(html).toContain('Data age unknown');
    expect(html).not.toContain('Data as of');
  });
});
