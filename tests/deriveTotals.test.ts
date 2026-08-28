import { describe, expect, it } from 'vitest';
import { deriveTotals } from '../src/deriveTotals';
import type { Plan, StoryPlan } from '../src/loadPlan';
import type { Progress, Totals } from '../src/loadProgress';

function makeStory(id: string): StoryPlan {
  return {
    id,
    title: id,
    release: 'r0',
    fulfills: [],
    narrative: '',
    acceptance: ['a', 'b'],
    blocked_by: [],
    owner_agent: 'Development Team',
    failure_paths: [],
    task_guidance: '',
    due_on: null,
    due_baseline_on: null,
  };
}

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [],
  releases: [],
  stories: [makeStory('STORY-001'), makeStory('STORY-002')],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

describe('deriveTotals', () => {
  it('passes through progress.totals verbatim when present, without recomputing', () => {
    const totals: Totals = {
      stories_total: 99,
      stories_verified: 1,
      stories_submitted: 0,
      stories_in_progress: 0,
      stories_not_started: 0,
      criteria_total: 5,
      criteria_passed: 5,
      points_awarded: 42,
    };
    const progress: Progress = { schema_version: 2, project: null, totals, stories: [] };
    expect(deriveTotals(plan, progress)).toBe(totals);
  });

  it('derives honestly from joined story state when totals is absent, and leaves points unknown', () => {
    const progress: Progress = {
      schema_version: 2,
      project: null,
      totals: null,
      stories: [
        {
          id: 'STORY-001',
          release: 'r0',
          acceptance_total: 2,
          criteria: [],
          files_touched: [],
          tests_added: [],
          notes: null,
          updated_at: null,
          verification: {
            state: 'verified',
            criteria_passed: 2,
            criteria_total: 2,
            verified_at: null,
            commit_sha: null,
            commit_url: null,
            commit_at: null,
            points_awarded: null,
            outstanding: [],
          },
        },
      ],
    };
    const result = deriveTotals(plan, progress);
    expect(result.stories_total).toBe(2);
    expect(result.stories_verified).toBe(1);
    expect(result.stories_not_started).toBe(1);
    expect(result.criteria_total).toBe(4);
    expect(result.criteria_passed).toBe(2);
    expect(result.points_awarded).toBeNull();
  });

  it('derives from an all-not-started state when progress is missing entirely', () => {
    const result = deriveTotals(plan, null);
    expect(result.stories_total).toBe(2);
    expect(result.stories_not_started).toBe(2);
    expect(result.points_awarded).toBeNull();
  });
});
