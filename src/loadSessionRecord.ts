import { logPersistenceAction } from './logPersistenceAction';
import type { KeyValueStore } from './keyValueStore';
import type { SessionRecord, SessionLoadResult } from './sessionRecord';

function keyFor(clientId: string): string {
  return `advisor.session.${clientId}`;
}

/**
 * Retrieves one client's persisted session record, if any. Corrupted or unreadable
 * data is reported as a meaningful error rather than thrown, so a reload never crashes
 * on stale/bad storage.
 */
export function loadSessionRecord(store: KeyValueStore, clientId: string, now: Date = new Date()): SessionLoadResult {
  let raw: string | null;
  try {
    raw = store.getItem(keyFor(clientId));
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logPersistenceAction({ action: 'load', clientId, ok: false, error, loggedAt: now.toISOString() });
    return { ok: false, error: `Could not read session data for client '${clientId}': ${error}` };
  }

  if (raw === null) {
    logPersistenceAction({ action: 'load', clientId, ok: true, error: null, loggedAt: now.toISOString() });
    return { ok: true, record: null };
  }

  try {
    const record = JSON.parse(raw) as SessionRecord;
    logPersistenceAction({ action: 'load', clientId, ok: true, error: null, loggedAt: now.toISOString() });
    return { ok: true, record };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logPersistenceAction({ action: 'load', clientId, ok: false, error, loggedAt: now.toISOString() });
    return { ok: false, error: `Session data for client '${clientId}' is corrupted and could not be read: ${error}` };
  }
}
