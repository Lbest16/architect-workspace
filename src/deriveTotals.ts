import type { Plan } from './loadPlan';
import type { Progress, Totals } from './loadProgress';
import { joinStories } from './joinStories';

export function deriveTotals(plan: Plan, progress: Progress | null): Totals {
  if (progress?.totals) return progress.totals;

  const joined = joinStories(plan.stories, progress);
  const stories_verified = joined.filter((s) => s.state === 'verified').length;
  const stories_submitted = joined.filter((s) => s.state === 'submitted').length;
  const stories_in_progress = joined.filter((s) => s.state === 'in_progress').length;
  const stories_not_started = joined.filter((s) => s.state === 'not_started').length;
  const criteria_total = joined.reduce((sum, s) => sum + s.criteriaTotal, 0);
  const criteria_passed = joined.reduce((sum, s) => sum + s.criteriaPassed, 0);

  return {
    stories_total: joined.length,
    stories_verified,
    stories_submitted,
    stories_in_progress,
    stories_not_started,
    criteria_total,
    criteria_passed,
    // No scoring formula exists in the committed files, so this cannot be derived honestly.
    points_awarded: null,
  };
}
