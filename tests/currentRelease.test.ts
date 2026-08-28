import { describe, expect, it } from 'vitest';
import { getCurrentRelease } from '../src/currentRelease';
import type { ReleasePlan } from '../src/loadPlan';
import type { JoinedStory } from '../src/joinStories';

function makeRelease(overrides: Partial<ReleasePlan>): ReleasePlan {
  return {
    key: 'r0',
    name: 'Release',
    goal: '',
    demo: '',
    week_start: 0,
    week_end: 1,
    story_ids: ['STORY-001'],
    starts_on: null,
    ends_on: null,
    is_demo_target: false,
    ...overrides,
  };
}

function makeJoined(id: string, state: JoinedStory['state']): JoinedStory {
  return {
    id,
    title: id,
    release: 'r0',
    fulfills: [],
    narrative: '',
    acceptance: [],
    blocked_by: [],
    owner_agent: '',
    failure_paths: [],
    task_guidance: '',
    due_on: null,
    due_baseline_on: null,
    state,
    criteriaPassed: 0,
    criteriaTotal: 0,
    commitUrl: null,
    verifiedAt: null,
  };
}

describe('getCurrentRelease', () => {
  it('returns none when there are no releases', () => {
    expect(getCurrentRelease([], [], '2026-08-27')).toEqual({ release: null, basis: 'none' });
  });

  it('prefers a release whose dated window contains today', () => {
    const r0 = makeRelease({ key: 'r0', starts_on: '2026-08-01', ends_on: '2026-08-10' });
    const r1 = makeRelease({ key: 'r1', starts_on: '2026-08-20', ends_on: '2026-08-30' });
    const result = getCurrentRelease([r0, r1], [], '2026-08-25');
    expect(result).toEqual({ release: r1, basis: 'date' });
  });

  it('falls back to the first release with unverified stories when no dates are set', () => {
    const r0 = makeRelease({ key: 'r0', story_ids: ['STORY-001'] });
    const r1 = makeRelease({ key: 'r1', story_ids: ['STORY-002'] });
    const joined = [makeJoined('STORY-001', 'verified'), makeJoined('STORY-002', 'not_started')];
    const result = getCurrentRelease([r0, r1], joined, '2026-08-27');
    expect(result).toEqual({ release: r1, basis: 'progress' });
  });

  it('falls back to the last release once every release is fully verified', () => {
    const r0 = makeRelease({ key: 'r0', story_ids: ['STORY-001'] });
    const r1 = makeRelease({ key: 'r1', story_ids: ['STORY-002'] });
    const joined = [makeJoined('STORY-001', 'verified'), makeJoined('STORY-002', 'verified')];
    const result = getCurrentRelease([r0, r1], joined, '2026-08-27');
    expect(result).toEqual({ release: r1, basis: 'progress' });
  });
});
