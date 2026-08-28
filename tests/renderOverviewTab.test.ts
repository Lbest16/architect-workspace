import { describe, expect, it } from 'vitest';
import { renderOverviewTab } from '../src/renderOverviewTab';
import type { Plan, StoryPlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

function makeStory(id: string, release: string): StoryPlan {
  return {
    id,
    title: id,
    release,
    fulfills: [],
    narrative: '',
    acceptance: ['a'],
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
  descriptor: 'An AI-powered tool for luxury retail client advisors.',
  requirements: [],
  releases: [
    { key: 'r0', name: 'Initial Setup', goal: '', demo: '', week_start: 0, week_end: 2, story_ids: ['STORY-001'], starts_on: null, ends_on: null, is_demo_target: false },
  ],
  stories: [makeStory('STORY-001', 'r0')],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };

const baseVm: TabVm = {
  plan,
  progress,
  manifest: null,
  mode: 'real',
  dataAge: null,
  todayIso: '2026-08-27',
  nowIso: '2026-08-27T12:00:00.000Z',
  detail: null,
};

describe('renderOverviewTab', () => {
  it('shows the real descriptor from the plan, not a hard-coded blurb', () => {
    const html = renderOverviewTab(baseVm);
    expect(html).toContain('An AI-powered tool for luxury retail client advisors.');
  });

  it('shows the current release and links it one level down into project management', () => {
    const html = renderOverviewTab(baseVm);
    expect(html).toContain('Initial Setup');
    expect(html).toContain('href="#project-management/r0"');
  });

  it('derives totals honestly from real story/criteria data when progress.totals is absent, and leaves points unknown rather than inventing a number', () => {
    const html = renderOverviewTab(baseVm);
    expect(html).toContain('0</strong> of <strong>1</strong> stories verified');
    expect(html).toContain('Points awarded: <strong>not available</strong>');
  });

  it('passes through progress.totals verbatim when the file provides it', () => {
    const withTotals: Progress = {
      ...progress,
      totals: {
        stories_total: 11,
        stories_verified: 2,
        stories_submitted: 0,
        stories_in_progress: 1,
        stories_not_started: 8,
        criteria_total: 33,
        criteria_passed: 6,
        points_awarded: 20,
      },
    };
    const html = renderOverviewTab({ ...baseVm, progress: withTotals });
    expect(html).toContain('2</strong> of <strong>11</strong> stories verified');
    expect(html).toContain('Points awarded: <strong>20</strong>');
  });

  it('renders an empty state instead of inventing a release when none exist', () => {
    const html = renderOverviewTab({ ...baseVm, plan: { ...plan, releases: [] } });
    expect(html).toContain('No release is planned yet');
  });

  it('marks the Command Center itself as live and every other listed system as unknown, never green', () => {
    const html = renderOverviewTab({ ...baseVm, plan: { ...plan, derived: { ...plan.derived, systems: ['Client CRM'] } } });
    expect(html).toContain('status-dot--live');
    expect(html).toContain('status-dot--unknown');
    expect(html).not.toMatch(/Client CRM[\s\S]*status-dot--live/);
  });
});
