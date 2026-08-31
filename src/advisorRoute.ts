export type AdvisorRoute = { view: 'roster' } | { view: 'client-detail'; clientId: string };

/** Parses the advisor app's hash into a route. Anything unrecognized falls back to the roster. */
export function parseAdvisorRoute(hash: string): AdvisorRoute {
  const clean = hash.replace(/^#\/?/, '');
  const [section, clientId] = clean.split('/');
  if (section === 'clients' && clientId) {
    return { view: 'client-detail', clientId: decodeURIComponent(clientId) };
  }
  return { view: 'roster' };
}

export function clientDetailHref(clientId: string): string {
  return `#/clients/${encodeURIComponent(clientId)}`;
}
