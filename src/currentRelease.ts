import type { ReleasePlan } from './loadPlan';
import type { JoinedStory } from './joinStories';

export type CurrentReleaseBasis = 'date' | 'progress' | 'none';

export interface CurrentReleaseResult {
  release: ReleasePlan | null;
  basis: CurrentReleaseBasis;
}

function isReleaseVerified(release: ReleasePlan, joinedStories: JoinedStory[]): boolean {
  const stories = joinedStories.filter((s) => release.story_ids.includes(s.id));
  if (stories.length === 0) return false;
  return stories.every((s) => s.state === 'verified');
}

export function getCurrentRelease(releases: ReleasePlan[], joinedStories: JoinedStory[], todayIso: string): CurrentReleaseResult {
  if (releases.length === 0) return { release: null, basis: 'none' };

  const dated = releases.find((r) => r.starts_on && r.ends_on && todayIso >= r.starts_on && todayIso <= r.ends_on);
  if (dated) return { release: dated, basis: 'date' };

  const firstUnfinished = releases.find((r) => !isReleaseVerified(r, joinedStories));
  if (firstUnfinished) return { release: firstUnfinished, basis: 'progress' };

  return { release: releases[releases.length - 1], basis: 'progress' };
}
