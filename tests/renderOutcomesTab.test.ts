import { describe, expect, it } from 'vitest';
import { renderOutcomesTab } from '../src/renderOutcomesTab';
import type { Plan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

const emptyPlan: Plan = {
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

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };

const baseVm: TabVm = {
  plan: emptyPlan,
  progress,
  manifest: null,
  mode: 'real',
  dataAge: null,
  todayIso: '2026-08-27',
  nowIso: '2026-08-27T12:00:00.000Z',
  detail: null,
};

describe('renderOutcomesTab', () => {
  it('shows an honest empty state instead of inventing a KPI when the plan has no measures', () => {
    const html = renderOutcomesTab(baseVm);
    expect(html).toContain('carries no numeric target yet');
  });

  it('renders one card per measure from plan.derived.measures', () => {
    const plan = { ...emptyPlan, derived: { ...emptyPlan.derived, measures: [{ id: 'M1', statement: 'Cut response time.' }] } };
    const html = renderOutcomesTab({ ...baseVm, plan });
    expect(html).toContain('M1');
    expect(html).toContain('Cut response time.');
    expect(html).toContain('href="#outcomes/M1"');
  });

  it('drills down one level to the measure detail without showing a fabricated measurement', () => {
    const plan = { ...emptyPlan, derived: { ...emptyPlan.derived, measures: [{ id: 'M1', statement: 'Cut response time.' }] } };
    const html = renderOutcomesTab({ ...baseVm, plan, detail: 'M1' });
    expect(html).toContain('Cut response time.');
    expect(html).toContain('No measurement has been taken yet');
    expect(html).toContain('Back to outcomes');
  });

  it('handles a stale or unknown detail id honestly', () => {
    const html = renderOutcomesTab({ ...baseVm, detail: 'does-not-exist' });
    expect(html).toContain('not in the current plan');
  });
});
