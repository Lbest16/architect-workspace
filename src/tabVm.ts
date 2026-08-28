import type { Plan } from './loadPlan';
import type { Progress } from './loadProgress';
import type { Manifest } from './loadManifest';
import type { DataMode } from './dataMode';
import type { DataAge } from './dataAge';

export interface TabVm {
  plan: Plan;
  progress: Progress;
  manifest: Manifest | null;
  mode: DataMode;
  dataAge: DataAge | null;
  todayIso: string;
  nowIso: string;
  detail: string | null;
}
