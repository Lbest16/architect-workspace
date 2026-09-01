export type PersistenceAction = 'save' | 'load';

export interface PersistenceActionEntry {
  action: PersistenceAction;
  clientId: string;
  ok: boolean;
  error: string | null;
  loggedAt: string;
}

const persistenceLog: PersistenceActionEntry[] = [];

/** Append-only audit trail of every session-data save/load attempt, successful or not. */
export function logPersistenceAction(entry: PersistenceActionEntry): void {
  persistenceLog.push(entry);
}

export function getPersistenceAuditLog(): readonly PersistenceActionEntry[] {
  return persistenceLog;
}

export function clearPersistenceAuditLog(): void {
  persistenceLog.length = 0;
}
