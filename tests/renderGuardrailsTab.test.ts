import { describe, expect, it } from 'vitest';
import { renderGuardrailsTab } from '../src/renderGuardrailsTab';
import type { Plan, StoryPlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

function makeStory(id: string): StoryPlan {
  return { id, title: `Title ${id}`, release: 'r2', fulfills: [], narrative: '', acceptance: [], blocked_by: [], owner_agent: '', failure_paths: [], task_guidance: '', due_on: null, due_baseline_on: null };
}

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [{ id: 'REQ-007', kind: 'SAFE', cluster: 'Data Management', priority: 'must', statement: 'Protect client privacy.', fulfilled_by: ['STORY-006'] }],
  releases: [],
  stories: [makeStory('STORY-006')],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [{ id: 'REQ-007', statement: 'Protect client privacy.' }], systems: [], roles: [], counts: {} },
};

const baseVm: TabVm = { plan, progress: { schema_version: 2, project: null, totals: null, stories: [] }, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderGuardrailsTab', () => {
  it('shows an honest empty state when the plan has no SAFE requirement', () => {
    const html = renderGuardrailsTab({ ...baseVm, plan: { ...plan, derived: { ...plan.derived, guardrails: [] } } });
    expect(html).toContain('no safety');
  });

  it('marks a guardrail not yet enforced when its story is not verified', () => {
    const html = renderGuardrailsTab(baseVm);
    expect(html).toContain('Not yet enforced');
    expect(html).not.toContain('pill--good');
  });

  it('marks a guardrail enforced only once every fulfilling story is verified', () => {
    const progress: Progress = {
      schema_version: 2,
      project: null,
      totals: null,
      stories: [{ id: 'STORY-006', release: 'r2', acceptance_total: 1, criteria: [], files_touched: [], tests_added: [], notes: null, updated_at: null, verification: { state: 'verified', criteria_passed: 1, criteria_total: 1, verified_at: null, commit_sha: null, commit_url: null, commit_at: null, points_awarded: null, outstanding: [] } }],
    };
    const html = renderGuardrailsTab({ ...baseVm, progress });
    expect(html).toContain('pill--good');
    expect(html).toContain('>Enforced<');
  });

  it('drills down to the fulfilling stories and their verification state', () => {
    const html = renderGuardrailsTab({ ...baseVm, detail: 'REQ-007' });
    expect(html).toContain('STORY-006');
    expect(html).toContain('not_started');
  });
});
