import { describe, expect, it } from 'vitest';
import { renderDataModelTab } from '../src/renderDataModelTab';
import { dataModelEntities } from '../src/dataModelSchema';
import type { Plan } from '../src/loadPlan';
import type { Progress } from '../src/loadProgress';
import type { TabVm } from '../src/tabVm';

const plan: Plan = {
  schema_version: 2,
  project_name: 'x',
  descriptor: 'x',
  requirements: [{ id: 'REQ-001', kind: 'FUNC', cluster: 'Opportunity Detection', priority: 'must', statement: 'x', fulfilled_by: [] }],
  releases: [],
  stories: [],
  agents: [],
  project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
  schedule: null,
  derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
};

const progress: Progress = { schema_version: 2, project: null, totals: null, stories: [] };
const baseVm: TabVm = { plan, progress, manifest: null, mode: 'real', dataAge: null, todayIso: '2026-08-27', nowIso: '2026-08-27T12:00:00.000Z', detail: null };

describe('renderDataModelTab', () => {
  it('renders one card per proposed entity, labelled as a starting point', () => {
    const html = renderDataModelTab(baseVm);
    expect(html).toContain('starting point');
    expect(html).toContain(dataModelEntities[0].name);
  });

  it('drills down to an entity with its fields and relationships', () => {
    const html = renderDataModelTab({ ...baseVm, detail: dataModelEntities[0].name });
    expect(html).toContain(dataModelEntities[0].fields[0]);
    expect(html).toContain(dataModelEntities[0].relationships[0]);
  });

  it('links a traced requirement id to its knowledge-base detail when the id exists in the real plan', () => {
    const html = renderDataModelTab({ ...baseVm, detail: 'client_profile' });
    expect(html).toContain('href="#knowledge-base/REQ-001"');
  });
});
