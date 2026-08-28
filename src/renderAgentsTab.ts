import type { TabVm } from './tabVm';
import type { AgentPlan, StoryPlan } from './loadPlan';
import { escapeHtml } from './escapeHtml';
import { detailHref, tabHref } from './route';
import { joinStories } from './joinStories';

interface OwnerGroup {
  name: string;
  storyIds: string[];
}

function groupByOwner(stories: StoryPlan[]): OwnerGroup[] {
  const byOwner = new Map<string, string[]>();
  for (const story of stories) {
    const owner = story.owner_agent || 'Unassigned';
    byOwner.set(owner, [...(byOwner.get(owner) ?? []), story.id]);
  }
  return Array.from(byOwner.entries()).map(([name, storyIds]) => ({ name, storyIds }));
}

function renderOwnedStories(vm: TabVm, storyIds: string[]): string {
  const joined = joinStories(vm.plan.stories, vm.progress).filter((s) => storyIds.includes(s.id));
  if (joined.length === 0) return `<p class="empty-state">No stories are currently assigned.</p>`;
  return `<ul class="detail-list">${joined.map((s) => `<li><a href="${detailHref('project-management', s.id)}">${escapeHtml(s.id)} — ${escapeHtml(s.title)}</a> (${escapeHtml(s.state)})</li>`).join('')}</ul>`;
}

function renderAgentCard(agent: AgentPlan): string {
  return `
    <a class="card" href="${detailHref('agents', agent.id)}">
      <div class="card__id">${escapeHtml(agent.name)}</div>
      <div class="card__body">${escapeHtml(agent.purpose)}</div>
      <div class="empty-state">No runs recorded.</div>
    </a>`;
}

function renderAgentDetail(agent: AgentPlan, vm: TabVm): string {
  return `
    <a class="back-link" href="${tabHref('agents')}">&larr; Back to AI agents</a>
    <h2>${escapeHtml(agent.name)}</h2>
    <p>${escapeHtml(agent.purpose)}</p>
    <p><strong>Trigger:</strong> ${escapeHtml(agent.trigger_type)} — ${escapeHtml(agent.trigger)}</p>
    <p><strong>Autonomy:</strong> ${escapeHtml(agent.autonomy_level)}</p>
    <p><strong>Inputs:</strong> ${agent.inputs.map(escapeHtml).join(', ') || 'none listed'}</p>
    <p><strong>Outputs:</strong> ${agent.outputs.map(escapeHtml).join(', ') || 'none listed'}</p>
    <p><strong>Approval gates:</strong> ${agent.approval_gates.map(escapeHtml).join(', ') || 'none listed'}</p>
    <h3>Skills</h3>
    ${agent.skills.length === 0 ? `<p class="empty-state">No skills registered yet.</p>` : `<ul class="detail-list">${agent.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`}
    <h3>Owns</h3>
    ${renderOwnedStories(vm, agent.owns)}
    <p class="empty-state">No runs recorded — this agent has not executed yet.</p>`;
}

export function renderAgentsTab(vm: TabVm): string {
  const agents = vm.plan.agents;

  if (agents.length > 0) {
    if (vm.detail) {
      const agent = agents.find((a) => a.id === vm.detail);
      if (!agent) {
        return `<a class="back-link" href="${tabHref('agents')}">&larr; Back to AI agents</a><p class="empty-state">That agent is not in the current plan.</p>`;
      }
      return renderAgentDetail(agent, vm);
    }
    return `<div class="card-grid">${agents.map(renderAgentCard).join('')}</div>`;
  }

  const groups = groupByOwner(vm.plan.stories);
  const note = `<p class="empty-state">Your plan does not carry a scoped agent roster yet. These are the teams that own each story — owners, not scoped AI agents.</p>`;

  if (vm.detail) {
    const group = groups.find((g) => g.name === vm.detail);
    if (!group) {
      return `<a class="back-link" href="${tabHref('agents')}">&larr; Back to AI agents</a><p class="empty-state">That team is not in the current plan.</p>`;
    }
    return `
      <a class="back-link" href="${tabHref('agents')}">&larr; Back to AI agents</a>
      <h2>${escapeHtml(group.name)}</h2>
      ${note}
      ${renderOwnedStories(vm, group.storyIds)}
      <p class="empty-state">No runs recorded — no scoped agent exists yet.</p>`;
  }

  if (groups.length === 0) return `${note}<p class="empty-state">No stories are assigned to an owner yet.</p>`;

  return `
    ${note}
    <div class="card-grid">
      ${groups
        .map(
          (g) => `
        <a class="card" href="${detailHref('agents', g.name)}">
          <div class="card__id">${escapeHtml(g.name)}</div>
          <div class="card__body">${g.storyIds.length} ${g.storyIds.length === 1 ? 'story' : 'stories'} owned</div>
        </a>`,
        )
        .join('')}
    </div>`;
}
