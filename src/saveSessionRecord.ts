import { logPersistenceAction } from './logPersistenceAction';
import type { KeyValueStore } from './keyValueStore';
import type { SessionRecord, SessionSaveResult } from './sessionRecord';

function keyFor(clientId: string): string {
  return `advisor.session.${clientId}`;
}

/**
 * Persists one client's session record so an advisor's in-progress draft and queue
 * state survive a reload. Every attempt, successful or not, is logged for audit.
 */
export function saveSessionRecord(store: KeyValueStore, record: SessionRecord, now: Date = new Date()): SessionSaveResult {
  try {
    store.setItem(keyFor(record.clientId), JSON.stringify(record));
    logPersistenceAction({ action: 'save', clientId: record.clientId, ok: true, error: null, loggedAt: now.toISOString() });
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logPersistenceAction({ action: 'save', clientId: record.clientId, ok: false, error, loggedAt: now.toISOString() });
    return { ok: false, error: `Could not save session data for client '${record.clientId}': ${error}` };
  }
}
