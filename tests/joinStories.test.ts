import { describe, expect, it } from 'vitest';
import { joinStories } from '../src/joinStories';
import type { StoryPlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';

const story: StoryPlan = {
  id: 'STORY-001',
  title: 'Identify Clienteling Opportunity',
  release: 'r0',
  fulfills: ['REQ-001'],
  narrative: 'As a luxury retail advisor, I want X, so that Y.',
  acceptance: ['a', 'b', 'c'],
  blocked_by: [],
  owner_agent: 'Development Team',
  failure_paths: [],
  task_guidance: '',
  due_on: null,
  due_baseline_on: null,
};

describe('joinStories', () => {
  it('defaults to not_started when progress has no matching entry', () => {
    const [joined] = joinStories([story], { schema_version: 2, project: null, totals: null, stories: [] });
    expect(joined.state).toBe('not_started');
    expect(joined.criteriaPassed).toBe(0);
    expect(joined.criteriaTotal).toBe(3);
  });

  it('defaults to not_started when progress is null entirely', () => {
    const [joined] = joinStories([story], null);
    expect(joined.state).toBe('not_started');
  });

  it('joins verification state and criteria counts from progress by story id', () => {
    const progress: Progress = {
      schema_version: 2,
      project: null,
      totals: null,
      stories: [
        {
          id: 'STORY-001',
          release: 'r0',
          acceptance_total: 3,
          criteria: [],
          files_touched: [],
          tests_added: [],
          notes: null,
          updated_at: null,
          verification: {
            state: 'verified',
            criteria_passed: 3,
            criteria_total: 3,
            verified_at: '2026-08-20T00:00:00.000Z',
            commit_sha: 'abc123',
            commit_url: 'https://example.com/commit/abc123',
            commit_at: '2026-08-20T00:00:00.000Z',
            points_awarded: 10,
            outstanding: [],
          },
        },
      ],
    };
    const [joined] = joinStories([story], progress);
    expect(joined.state).toBe('verified');
    expect(joined.criteriaPassed).toBe(3);
    expect(joined.commitUrl).toBe('https://example.com/commit/abc123');
  });
});
