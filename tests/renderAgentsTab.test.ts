import { describe, expect, it } from 'vitest';
import { renderAgentsTab } from '../src/renderAgentsTab';
import type { Plan, StoryPlan, AgentPlan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

function makeStory(id: string, owner: string): StoryPlan {
  return { id, title: `Title ${id}`, release: 'r0', fulfills: [], narrative: '', acceptance: [], blocked_by: [], owner_agent: owner, failure_paths: [], task_guidance: '', due_on: null, due_baseline_on: null };
}

const planWithNoAgents: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [],
  releases: [],
  stories: [makeStory('STORY-001', 'Development Team'), makeStory('STORY-006', 'Security Team')],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };
const baseVm: TabVm = { plan: planWithNoAgents, progress, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderAgentsTab', () => {
  it('falls back to grouping stories by owner_agent when the plan has no scoped agent roster', () => {
    const html = renderAgentsTab(baseVm);
    expect(html).toContain('Development Team');
    expect(html).toContain('Security Team');
    expect(html).toContain('owners, not scoped AI agents');
  });

  it('never shows a success rate or run history — only "no runs recorded"', () => {
    const html = renderAgentsTab({ ...baseVm, detail: 'Development Team' });
    expect(html).toContain('No runs recorded');
    expect(html).not.toMatch(/success rate/i);
  });

  it('renders full agent cards from plan.agents when a scoped roster exists', () => {
    const agent: AgentPlan = { id: 'a1', name: 'Opportunity Scout', purpose: 'Find opportunities.', trigger_type: 'manual', trigger: 'x', inputs: ['profile'], outputs: ['opportunity'], autonomy_level: 'human-in-the-loop', approval_gates: ['advisor review'], escalation_rules: [], skills: [], owns: ['STORY-001'] };
    const plan = { ...planWithNoAgents, agents: [agent] };
    const html = renderAgentsTab({ ...baseVm, plan });
    expect(html).toContain('Opportunity Scout');
    expect(html).toContain('No runs recorded');
  });

  it('shows "no skills registered yet" instead of an empty box', () => {
    const agent: AgentPlan = { id: 'a1', name: 'Opportunity Scout', purpose: '', trigger_type: '', trigger: '', inputs: [], outputs: [], autonomy_level: '', approval_gates: [], escalation_rules: [], skills: [], owns: [] };
    const plan = { ...planWithNoAgents, agents: [agent] };
    const html = renderAgentsTab({ ...baseVm, plan, detail: 'a1' });
    expect(html).toContain('No skills registered yet');
  });
});
