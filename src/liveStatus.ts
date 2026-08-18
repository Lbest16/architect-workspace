export type LiveStatus = 'live' | 'unknown';

export interface LiveIndicator {
  id: string;
  label: string;
  status: LiveStatus;
  lastCheckedIso: string | null;
}

export function getOverviewLiveIndicators(nowIso: string): LiveIndicator[] {
  return [
    {
      id: 'command-center',
      label: 'Command Center (this page)',
      status: 'live',
      lastCheckedIso: nowIso,
    },
    {
      id: 'clienteling-agent',
      label: 'Luxury Client Intelligence Agent (the product itself)',
      status: 'unknown',
      lastCheckedIso: null,
    },
  ];
}
