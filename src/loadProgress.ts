import { fetchJson, type FetchJsonResult } from './fetchJson';

export type VerificationState = 'not_started' | 'in_progress' | 'submitted' | 'verified';

export interface Criterion {
  text: string;
  passed: boolean;
  evidence?: string;
}

export interface Verification {
  state: VerificationState;
  criteria_passed: number;
  criteria_total: number;
  verified_at: string | null;
  commit_sha: string | null;
  commit_url: string | null;
  commit_at: string | null;
  points_awarded: number | null;
  outstanding: string[];
}

export interface ProgressStory {
  id: string;
  release: string | null;
  acceptance_total: number | null;
  criteria: Criterion[];
  files_touched: string[];
  tests_added: string[];
  notes: string | null;
  updated_at: string | null;
  verification: Verification | null;
}

export interface Totals {
  stories_total: number;
  stories_verified: number;
  stories_submitted: number;
  stories_in_progress: number;
  stories_not_started: number;
  criteria_total: number;
  criteria_passed: number;
  points_awarded: number | null;
}

export interface Progress {
  schema_version: number;
  project: string | null;
  totals: Totals | null;
  stories: ProgressStory[];
}

const PROGRESS_PATH = './.colaberry/progress.json';

export function loadProgress(): Promise<FetchJsonResult<Progress>> {
  return fetchJson<Progress>(PROGRESS_PATH);
}
