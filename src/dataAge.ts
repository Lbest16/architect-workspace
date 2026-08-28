const STALE_AFTER_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface DataAge {
  ageDays: number;
  isStale: boolean;
  absoluteLabel: string;
  relativeLabel: string;
  label: string;
}

function formatAbsoluteDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function formatRelative(ageDays: number): string {
  if (ageDays <= 0) return 'today';
  if (ageDays === 1) return '1 day ago';
  return `${ageDays} days ago`;
}

export function getDataAge(generatedAtIso: string, nowIso: string): DataAge | null {
  const generatedAt = new Date(generatedAtIso).getTime();
  const now = new Date(nowIso).getTime();
  if (Number.isNaN(generatedAt) || Number.isNaN(now)) return null;

  const ageDays = Math.max(0, Math.floor((now - generatedAt) / MS_PER_DAY));
  const isStale = ageDays > STALE_AFTER_DAYS;
  const absoluteLabel = formatAbsoluteDate(generatedAtIso);
  const relativeLabel = formatRelative(ageDays);

  return {
    ageDays,
    isStale,
    absoluteLabel,
    relativeLabel,
    label: `Data as of ${absoluteLabel} (${relativeLabel})`,
  };
}
