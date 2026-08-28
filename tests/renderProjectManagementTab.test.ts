import { describe, expect, it } from 'vitest';
import { renderProjectManagementTab } from '../src/renderProjectManagementTab';
import type { Plan, StoryPlan, ReleasePlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

const release: ReleasePlan = { key: 'r0', name: 'Initial Setup', goal: 'Establish core functionality.', demo: 'Show the opportunity flow.', week_start: 0, week_end: 2, story_ids: ['STORY-001'], starts_on: null, ends_on: null, is_demo_target: false };

const story: StoryPlan = { id: 'STORY-001', title: 'Identify Clienteling Opportunity', release: 'r0', fulfills: ['REQ-001'], narrative: 'As a luxury retail advisor, I want X.', acceptance: ['Given a, When b, Then c.'], blocked_by: [], owner_agent: 'Development Team', failure_paths: [], task_guidance: '', due_on: '2026-08-25', due_baseline_on: '2026-08-20' };

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [],
  releases: [release],
  stories: [story],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };

const baseVm: TabVm = { plan, progress, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderProjectManagementTab', () => {
  it('renders a Gantt row and a task row for every real release and story', () => {
    const html = renderProjectManagementTab(baseVm);
    expect(html).toContain('Initial Setup');
    expect(html).toContain('STORY-001');
    expect(html).toContain('href="#project-management/r0"');
    expect(html).toContain('href="#project-management/STORY-001"');
  });

  it('shows both the current due date and the original baseline due date so slippage is visible', () => {
    const html = renderProjectManagementTab(baseVm);
    expect(html).toContain('2026-08-25');
    expect(html).toContain('2026-08-20');
  });

  it('drills down into a release detail listing its stories', () => {
    const html = renderProjectManagementTab({ ...baseVm, detail: 'r0' });
    expect(html).toContain('Establish core functionality.');
    expect(html).toContain('STORY-001');
  });

  it('drills down into a story detail with acceptance criteria and status, without fabricating a commit', () => {
    const html = renderProjectManagementTab({ ...baseVm, detail: 'STORY-001' });
    expect(html).toContain('Given a, When b, Then c.');
    expect(html).toContain('not_started');
    expect(html).toContain('No verifying commit recorded yet.');
  });

  it('shows an honest empty state for an unknown detail id', () => {
    const html = renderProjectManagementTab({ ...baseVm, detail: 'STORY-999' });
    expect(html).toContain('not in the current plan');
  });
});
