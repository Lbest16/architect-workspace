import type { KeyValueStore } from './keyValueStore';

export type BrowserKeyValueStoreResult = { ok: true; store: KeyValueStore } | { ok: false; error: string };

const PROBE_KEY = '__advisor_storage_probe__';

/**
 * Resolves the browser's localStorage as a KeyValueStore, probing it with a throwaway
 * write so an unavailable or full/disabled store is reported as a meaningful error
 * instead of failing later, mid-save.
 */
export function getBrowserKeyValueStore(): BrowserKeyValueStoreResult {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return { ok: false, error: 'Browser storage is not available in this environment.' };
  }

  const store = window.localStorage;
  try {
    store.setItem(PROBE_KEY, '1');
    store.removeItem(PROBE_KEY);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Browser storage is unavailable or full: ${detail}` };
  }

  return { ok: true, store };
}
