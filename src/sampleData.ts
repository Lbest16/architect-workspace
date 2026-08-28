import type { Plan, ReleasePlan, AgentPlan, Measure, Schedule } from './loadPlan';
import type { Progress, Totals } from './loadProgress';
import { deriveTotals } from './deriveTotals';

const SAMPLE_SCHEDULE: Schedule = {
  build_start: '2026-08-13',
  build_end: '2026-10-01',
  demo_day: '2026-10-08',
  build_weeks: 8,
  demo_release_key: 'r4',
  roadmap_release_keys: ['r0', 'r1', 'r2', 'r3', 'r4'],
  prep: ['Confirm sample client dataset', 'Rehearse the demo script'],
};

const SAMPLE_RELEASE_WINDOWS: Record<string, { starts_on: string; ends_on: string }> = {
  r0: { starts_on: '2026-08-13', ends_on: '2026-08-25' },
  r1: { starts_on: '2026-08-28', ends_on: '2026-09-07' },
  r2: { starts_on: '2026-09-04', ends_on: '2026-09-13' },
  r3: { starts_on: '2026-09-13', ends_on: '2026-09-19' },
  r4: { starts_on: '2026-10-01', ends_on: '2026-10-01' },
};

const SAMPLE_MEASURES: Measure[] = [
  { id: 'SAMPLE-M1', statement: 'Advisor time-to-first-outreach drops from a day to under an hour.' },
  { id: 'SAMPLE-M2', statement: 'Every generated message is reviewed by a human before it sends.' },
];

const SAMPLE_SYSTEMS: string[] = ['Client CRM (illustrative)', 'Product Catalog Service (illustrative)'];

const SAMPLE_AGENTS: AgentPlan[] = [
  {
    id: 'sample-agent-opportunity',
    name: 'Opportunity Scout (illustrative)',
    purpose: 'Surface the strongest clienteling opportunity from a client profile.',
    trigger_type: 'manual',
    trigger: 'Advisor opens a client record',
    inputs: ['client profile', 'purchase history', 'product catalog'],
    outputs: ['ranked opportunity with reasoning'],
    autonomy_level: 'human-in-the-loop',
    approval_gates: ['advisor reviews before acting'],
    escalation_rules: ['low-confidence match is flagged, not shown as certain'],
    skills: [],
    owns: ['STORY-001'],
  },
];

/** Fills only the gaps the real plan leaves empty, so every value that IS real stays real. */
export function buildSamplePlan(real: Plan): Plan {
  const releases: ReleasePlan[] = real.releases.map((release) => {
    if (release.starts_on && release.ends_on) return release;
    const window = SAMPLE_RELEASE_WINDOWS[release.key];
    if (!window) return release;
    return { ...release, starts_on: window.starts_on, ends_on: window.ends_on };
  });

  return {
    ...real,
    releases,
    schedule: real.schedule ?? SAMPLE_SCHEDULE,
    agents: real.agents.length > 0 ? real.agents : SAMPLE_AGENTS,
    derived: {
      ...real.derived,
      measures: real.derived.measures.length > 0 ? real.derived.measures : SAMPLE_MEASURES,
      systems: real.derived.systems.length > 0 ? real.derived.systems : SAMPLE_SYSTEMS,
    },
  };
}

/** Sample totals are still derived honestly from the real story/criteria data — only the shape is filled in. */
export function buildSampleProgress(real: Progress, plan: Plan): Progress {
  const totals: Totals = real.totals ?? deriveTotals(plan, real);
  return { ...real, totals };
}
