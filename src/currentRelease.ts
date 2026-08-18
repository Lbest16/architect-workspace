import type { Release } from './releases';

export function getCurrentRelease(releases: Release[], todayIso: string): Release | null {
  if (releases.length === 0) return null;

  const active = releases.find((r) => todayIso >= r.startIso && todayIso <= r.endIso);
  if (active) return active;

  const sorted = [...releases].sort((a, b) => a.startIso.localeCompare(b.startIso));
  const upcoming = sorted.find((r) => r.startIso > todayIso);
  if (upcoming) return upcoming;

  return sorted[sorted.length - 1];
}
