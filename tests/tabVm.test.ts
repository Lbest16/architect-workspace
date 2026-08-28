import { describe, expect, it } from 'vitest';
import type { TabVm } from '../src/tabVm';

describe('TabVm', () => {
  it('describes the shared shape every tab renders from', () => {
    const vm: TabVm = {
      plan: {
        schema_version: 2,
        project_name: 'x',
        descriptor: 'x',
        requirements: [],
        releases: [],
        stories: [],
        agents: [],
        project: { name: 'x', descriptor: 'x', repo_url: null, plan_version: 1, plan_sha256: '' },
        schedule: null,
        derived: { measures: [], guardrails: [], systems: [], roles: [], counts: {} },
      },
      progress: { schema_version: 2, project: null, totals: null, stories: [] },
      manifest: null,
      mode: 'real',
      dataAge: null,
      todayIso: '2026-08-27',
      nowIso: '2026-08-27T00:00:00.000Z',
      detail: null,
    };
    expect(vm.mode).toBe('real');
    expect(vm.detail).toBeNull();
  });
});
