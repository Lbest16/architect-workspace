import { describe, expect, it } from 'vitest';
import { renderKnowledgeBaseTab } from '../src/renderKnowledgeBaseTab';
import type { Plan, StoryPlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

const covered: StoryPlan = { id: 'STORY-006', title: 'Implement Privacy Protection Measures', release: 'r2', fulfills: ['REQ-007'], narrative: '', acceptance: [], blocked_by: [], owner_agent: '', failure_paths: [], task_guidance: '', due_on: null, due_baseline_on: null };

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [
    { id: 'REQ-007', kind: 'SAFE', cluster: 'Data Management', priority: 'must', statement: 'Protect client privacy.', fulfilled_by: ['STORY-006'] },
    { id: 'REQ-006', kind: 'CONSTRAINT', cluster: 'Data Management', priority: 'must', statement: 'Use fictional data.', fulfilled_by: [] },
  ],
  releases: [],
  stories: [covered],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };
const baseVm: TabVm = { plan, progress, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderKnowledgeBaseTab', () => {
  it('shows the traceability table with every requirement and its covering stories', () => {
    const html = renderKnowledgeBaseTab(baseVm);
    expect(html).toContain('REQ-007');
    expect(html).toContain('STORY-006');
  });

  it('flags a must requirement with no fulfilling story as a real gap, rather than hiding the row', () => {
    const html = renderKnowledgeBaseTab(baseVm);
    expect(html).toContain('GAP');
    expect(html).toContain('row--gap');
  });

  it('drills down to a requirement detail with its fulfilling stories', () => {
    const html = renderKnowledgeBaseTab({ ...baseVm, detail: 'REQ-007' });
    expect(html).toContain('Protect client privacy.');
    expect(html).toContain('STORY-006');
  });

  it('answers a search from the real data and cites which tab it came from', () => {
    const html = renderKnowledgeBaseTab({ ...baseVm, detail: 'search/privacy' });
    expect(html).toContain('REQ-007');
    expect(html).toContain('from knowledge-base');
  });

  it('says it cannot answer instead of guessing when nothing matches', () => {
    const html = renderKnowledgeBaseTab({ ...baseVm, detail: 'search/zzz-nonexistent' });
    expect(html).toContain("can't answer that from the data I have");
  });
});
