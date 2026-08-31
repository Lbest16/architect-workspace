import { describe, expect, it } from 'vitest';
import { parseAdvisorRoute, clientDetailHref } from '../src/advisorRoute';

describe('parseAdvisorRoute', () => {
  it('defaults to the roster for an empty or unrecognized hash', () => {
    expect(parseAdvisorRoute('')).toEqual({ view: 'roster' });
    expect(parseAdvisorRoute('#/nonsense')).toEqual({ view: 'roster' });
  });

  it('parses a client detail hash into the client id', () => {
    expect(parseAdvisorRoute('#/clients/CLT-1')).toEqual({ view: 'client-detail', clientId: 'CLT-1' });
  });

  it('decodes an encoded client id', () => {
    expect(parseAdvisorRoute('#/clients/CLT%201')).toEqual({ view: 'client-detail', clientId: 'CLT 1' });
  });
});

describe('clientDetailHref', () => {
  it('builds a hash link that parses back to the same client id', () => {
    const href = clientDetailHref('CLT-1');
    expect(parseAdvisorRoute(href)).toEqual({ view: 'client-detail', clientId: 'CLT-1' });
  });
});
