export type LiveStatus = 'live' | 'unknown';

export interface LiveIndicator {
  id: string;
  label: string;
  status: LiveStatus;
  lastCheckedIso: string | null;
}

export function getLiveIndicators(systemNames: string[], nowIso: string): LiveIndicator[] {
  const commandCenter: LiveIndicator = {
    id: 'command-center',
    label: 'Command Center (this page)',
    status: 'live',
    lastCheckedIso: nowIso,
  };

  const systems: LiveIndicator[] = systemNames.map((name, index) => ({
    id: `system-${index}`,
    label: name,
    status: 'unknown',
    lastCheckedIso: null,
  }));

  return [commandCenter, ...systems];
}
