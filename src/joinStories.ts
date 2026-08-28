import type { StoryPlan } from './loadPlan';
import type { Progress, VerificationState } from './loadProgress';

export interface JoinedStory extends StoryPlan {
  state: VerificationState;
  criteriaPassed: number;
  criteriaTotal: number;
  commitUrl: string | null;
  verifiedAt: string | null;
}

export function joinStories(stories: StoryPlan[], progress: Progress | null): JoinedStory[] {
  const progressById = new Map((progress?.stories ?? []).map((s) => [s.id, s]));

  return stories.map((story) => {
    const p = progressById.get(story.id);
    const verification = p?.verification ?? null;
    return {
      ...story,
      state: verification?.state ?? 'not_started',
      criteriaPassed: verification?.criteria_passed ?? 0,
      criteriaTotal: verification?.criteria_total ?? story.acceptance.length,
      commitUrl: verification?.commit_url ?? null,
      verifiedAt: verification?.verified_at ?? null,
    };
  });
}
