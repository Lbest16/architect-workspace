import { describe, expect, it } from 'vitest';
import { buildSamplePlan, buildSampleProgress } from '../src/sampleData';
import type { Plan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';

const realPlan: Plan = {
  schema_version: 2,
  project_name: 'Luxury Client Intelligence Agent',
  descriptor: 'x',
  requirements: [],
  releases: [
    { key: 'r0', name: 'r0', goal: '', demo: '', week_start: 0, week_end: 1, story_ids: [], starts_on: null, ends_on: null, is_demo_target: false },
    { key: 'r9', name: 'r9', goal: '', demo: '', week_start: 0, week_end: 1, story_ids: [], starts_on: '2026-01-01', ends_on: '2026-01-02', is_demo_target: false },
  ],
  stories: [],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

describe('buildSamplePlan', () => {
  it('fills release dates only where the real plan left them null', () => {
    const sample = buildSamplePlan(realPlan);
    expect(sample.releases[0].starts_on).toBe('2026-08-13');
    expect(sample.releases[1].starts_on).toBe('2026-01-01');
  });

  it('fills schedule, agents, measures and systems only when the real plan has none', () => {
    const sample = buildSamplePlan(realPlan);
    expect(sample.schedule).not.toBeNull();
    expect(sample.agents.length).toBeGreaterThan(0);
    expect(sample.derived.measures.length).toBeGreaterThan(0);
    expect(sample.derived.systems.length).toBeGreaterThan(0);
  });

  it('leaves real values alone when the plan already has them', () => {
    const withRealAgents: Plan = { ...realPlan, agents: [{ id: 'a', name: 'Real Agent', purpose: '', trigger_type: '', trigger: '', inputs: [], outputs: [], autonomy_level: '', approval_gates: [], escalation_rules: [], skills: [], owns: [] }] };
    const sample = buildSamplePlan(withRealAgents);
    expect(sample.agents).toEqual(withRealAgents.agents);
  });
});

describe('buildSampleProgress', () => {
  it('derives totals honestly rather than inventing a points value', () => {
    const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };
    const sample = buildSampleProgress(progress, realPlan);
    expect(sample.totals?.points_awarded).toBeNull();
  });

  it('passes through real totals when present', () => {
    const totals = { stories_total: 1, stories_verified: 1, stories_submitted: 0, stories_in_progress: 0, stories_not_started: 0, criteria_total: 1, criteria_passed: 1, points_awarded: 5 };
    const progress: Progress = { schema_version: 2, project: null, totals, stories: [] };
    const sample = buildSampleProgress(progress, realPlan);
    expect(sample.totals).toBe(totals);
  });
});
