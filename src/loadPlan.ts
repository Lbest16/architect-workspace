import { fetchJson, type FetchJsonResult } from './fetchJson';

export interface Requirement {
  id: string;
  kind: string;
  cluster: string;
  priority: string;
  statement: string;
  fulfilled_by: string[];
}

export interface ReleasePlan {
  key: string;
  name: string;
  goal: string;
  demo: string;
  week_start: number;
  week_end: number;
  story_ids: string[];
  starts_on: string | null;
  ends_on: string | null;
  is_demo_target: boolean;
}

export interface StoryPlan {
  id: string;
  title: string;
  release: string;
  fulfills: string[];
  narrative: string;
  acceptance: string[];
  blocked_by: string[];
  owner_agent: string;
  failure_paths: string[];
  task_guidance: string;
  due_on: string | null;
  due_baseline_on: string | null;
}

export interface AgentPlan {
  id: string;
  name: string;
  purpose: string;
  trigger_type: string;
  trigger: string;
  inputs: string[];
  outputs: string[];
  autonomy_level: string;
  approval_gates: string[];
  escalation_rules: string[];
  skills: string[];
  owns: string[];
}

export interface Measure {
  id: string;
  statement: string;
}

export interface Guardrail {
  id: string;
  statement: string;
}

export interface Schedule {
  build_start: string | null;
  build_end: string | null;
  demo_day: string | null;
  build_weeks: number | null;
  demo_release_key: string | null;
  roadmap_release_keys: string[];
  prep: string[];
}

export interface Derived {
  measures: Measure[];
  guardrails: Guardrail[];
  systems: string[];
  roles: string[];
  counts: Record<string, unknown>;
}

export interface PlanProject {
  name: string;
  descriptor: string;
  repo_url: string | null;
  plan_version: number;
  plan_sha256: string;
}

export interface Plan {
  schema_version: number;
  project_name: string;
  descriptor: string;
  requirements: Requirement[];
  releases: ReleasePlan[];
  stories: StoryPlan[];
  agents: AgentPlan[];
  project: PlanProject;
  schedule: Schedule | null;
  derived: Derived;
}

const PLAN_PATH = './.colaberry/plan.json';

export function loadPlan(): Promise<FetchJsonResult<Plan>> {
  return fetchJson<Plan>(PLAN_PATH);
}
