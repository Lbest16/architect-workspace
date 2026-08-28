import { describe, expect, it } from 'vitest';
import { renderShell } from '../src/renderShell';
import type { Plan } from '../src/loadPlan';

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [],
  releases: [],
  stories: [],
  agents: [],
  project: { name: 'Luxury Client Intelligence Agent', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

describe('renderShell', () => {
  it('shows the real project name from plan.project, the tab nav and the mode switch on every render', () => {
    const html = renderShell({ plan, mode: 'real', dataAge: null, activeTab: 'overview' });
    expect(html).toContain('Luxury Client Intelligence Agent');
    expect(html).toContain('tab-nav');
    expect(html).toContain('mode-switch');
  });

  it('shows a generic honest title instead of inventing a project name before the plan has loaded', () => {
    const html = renderShell({ plan: null, mode: 'real', dataAge: null, activeTab: 'overview' });
    expect(html).toContain('Command Center');
  });

  it('shows the sample banner on every tab when in sample mode, not just overview', () => {
    for (const tab of ['overview', 'outcomes', 'systems'] as const) {
      const html = renderShell({ plan, mode: 'sample', dataAge: null, activeTab: tab });
      expect(html).toContain('SAMPLE');
    }
  });
});
