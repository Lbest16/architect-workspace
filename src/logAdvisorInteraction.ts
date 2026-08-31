export type AdvisorInteractionType = 'navigation' | 'message_edited' | 'message_queued';

export interface AdvisorInteractionEntry {
  type: AdvisorInteractionType;
  detail: string;
  loggedAt: string;
}

const interactionLog: AdvisorInteractionEntry[] = [];

/** Append-only audit trail of advisor interactions with the UI, so usage stays inspectable. */
export function logAdvisorInteraction(entry: AdvisorInteractionEntry): void {
  interactionLog.push(entry);
}

export function getAdvisorInteractionLog(): readonly AdvisorInteractionEntry[] {
  return interactionLog;
}

export function clearAdvisorInteractionLog(): void {
  interactionLog.length = 0;
}
