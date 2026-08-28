import { describe, expect, it } from 'vitest';
import { renderUsersTab } from '../src/renderUsersTab';
import type { Plan, StoryPlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

function makeStory(id: string, narrative: string): StoryPlan {
  return { id, title: id, release: 'r0', fulfills: [], narrative, acceptance: [], blocked_by: [], owner_agent: '', failure_paths: [], task_guidance: '', due_on: null, due_baseline_on: null };
}

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [],
  releases: [],
  stories: [makeStory('STORY-001', 'As a luxury retail advisor, I want to identify opportunities, so that I can prioritize.')],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: ['luxury retail advisor', 'compliance officer'], counts: {} },
};

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };

const baseVm: TabVm = { plan, progress, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderUsersTab', () => {
  it('lists every role from plan.derived.roles as a card', () => {
    const html = renderUsersTab(baseVm);
    expect(html).toContain('luxury retail advisor');
    expect(html).toContain('compliance officer');
    expect(html).toContain('href="#users/compliance%20officer"');
  });

  it('drills down to the story narratives that name the role', () => {
    const html = renderUsersTab({ ...baseVm, detail: 'luxury retail advisor' });
    expect(html).toContain('STORY-001');
    expect(html).toContain('identify opportunities');
  });

  it('shows an honest empty state for a role with no matching narrative rather than hiding the role', () => {
    const html = renderUsersTab({ ...baseVm, detail: 'compliance officer' });
    expect(html).toContain('No story narrative currently names this role');
  });

  it('handles an unknown role id honestly', () => {
    const html = renderUsersTab({ ...baseVm, detail: 'not-a-role' });
    expect(html).toContain('not in the current plan');
  });
});
