import { describe, expect, it } from 'vitest';
import { searchKnowledge } from '../src/knowledgeSearch';
import type { Plan } from '../src/loadPlan';

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [{ id: 'REQ-007', kind: 'SAFE', cluster: 'Data Management', priority: 'must', statement: 'Protect client privacy by not using real customer information.', fulfilled_by: ['STORY-006'] }],
  releases: [],
  stories: [{ id: 'STORY-006', title: 'Implement Privacy Protection Measures', release: 'r2', fulfills: ['REQ-007'], narrative: 'As an advisor, I want privacy.', acceptance: [], blocked_by: [], owner_agent: '', failure_paths: [], task_guidance: '', due_on: null, due_baseline_on: null }],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

describe('searchKnowledge', () => {
  it('returns nothing for an empty query rather than dumping everything', () => {
    expect(searchKnowledge(plan, '')).toEqual([]);
    expect(searchKnowledge(plan, '   ')).toEqual([]);
  });

  it('matches a requirement by statement text and cites the knowledge-base tab', () => {
    const hits = searchKnowledge(plan, 'privacy');
    expect(hits.some((h) => h.label === 'REQ-007' && h.tab === 'knowledge-base')).toBe(true);
  });

  it('matches a story by title and cites the project-management tab', () => {
    const hits = searchKnowledge(plan, 'privacy protection measures');
    expect(hits.some((h) => h.label === 'STORY-006' && h.tab === 'project-management')).toBe(true);
  });

  it('returns no hits, honestly, when nothing in the data matches', () => {
    expect(searchKnowledge(plan, 'zzz-nonexistent')).toEqual([]);
  });
});
