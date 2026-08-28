export const TAB_IDS = [
  'overview',
  'outcomes',
  'users',
  'guardrails',
  'systems',
  'project-management',
  'agents',
  'knowledge-base',
  'data-model',
] as const;

export type TabId = (typeof TAB_IDS)[number];

export const TAB_LABELS: Record<TabId, string> = {
  overview: 'Overview',
  outcomes: 'Outcomes',
  users: 'Users & use case',
  guardrails: 'Guardrails',
  systems: 'Systems',
  'project-management': 'Project management',
  agents: 'AI agents',
  'knowledge-base': 'Knowledge base',
  'data-model': 'Data model',
};

export interface Route {
  tab: TabId;
  detail: string | null;
}

function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}

export function parseRoute(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const [tabPart, ...rest] = clean.split('/');
  const tab = isTabId(tabPart) ? tabPart : 'overview';
  const detail = rest.length > 0 ? decodeURIComponent(rest.join('/')) : null;
  return { tab, detail };
}

export function tabHref(tab: TabId): string {
  return `#${tab}`;
}

export function detailHref(tab: TabId, ...parts: string[]): string {
  return `#${tab}/${parts.map(encodeURIComponent).join('/')}`;
}
