import { describe, expect, it } from 'vitest';
import { renderSystemsTab } from '../src/renderSystemsTab';
import type { Plan } from '../src/loadPlan';
import type { TabVm } from '../src/tabVm';

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [],
  releases: [],
  stories: [],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

const baseVm: TabVm = { plan, progress: { schema_version: 2, project: null, totals: null, stories: [] }, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderSystemsTab', () => {
  it('shows an honest empty state when the plan names no system', () => {
    expect(renderSystemsTab(baseVm)).toContain('names no external system yet');
  });

  it('never shows a system as connected — status is always grey/unknown, never a live claim', () => {
    const withSystems = { ...plan, derived: { ...plan.derived, systems: ['Client CRM'] } };
    const html = renderSystemsTab({ ...baseVm, plan: withSystems });
    expect(html).toContain('status-dot--unknown');
    expect(html).not.toContain('status-dot--live');
    expect(html).toContain('not checked from here');
  });

  it('drills down to a detail page that still refuses to claim a connection', () => {
    const withSystems = { ...plan, derived: { ...plan.derived, systems: ['Client CRM'] } };
    const html = renderSystemsTab({ ...baseVm, plan: withSystems, detail: 'Client CRM' });
    expect(html).toContain('Not checked from here');
    expect(html).not.toContain('status-dot--live');
  });
});
