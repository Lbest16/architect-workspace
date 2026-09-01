import { beforeEach, describe, expect, it } from 'vitest';
import { saveSessionRecord } from '../src/saveSessionRecord';
import { clearPersistenceAuditLog, getPersistenceAuditLog } from '../src/logPersistenceAction';
import type { KeyValueStore } from '../src/keyValueStore';
import type { SessionRecord } from '../src/sessionRecord';

const sampleRecord: SessionRecord = {
  clientId: 'CLT-1',
  subject: 'A new arrival for you',
  body: 'Thought of you when this landed.',
  queued: false,
  savedAt: '2026-09-01T00:00:00.000Z',
};

function memoryStore(): KeyValueStore {
  const backing = new Map<string, string>();
  return {
    getItem: (key) => backing.get(key) ?? null,
    setItem: (key, value) => backing.set(key, value),
    removeItem: (key) => backing.delete(key),
  };
}

describe('saveSessionRecord', () => {
  beforeEach(() => {
    clearPersistenceAuditLog();
  });

  it('saves the record and logs a successful save', () => {
    const store = memoryStore();
    const result = saveSessionRecord(store, sampleRecord, new Date('2026-09-01T00:00:00.000Z'));

    expect(result.ok).toBe(true);
    expect(store.getItem('advisor.session.CLT-1')).toBe(JSON.stringify(sampleRecord));

    const log = getPersistenceAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ action: 'save', clientId: 'CLT-1', ok: true, error: null });
  });

  it('returns a meaningful error and logs the failure when the store throws', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage is full');
      },
      removeItem: () => {},
    };

    const result = saveSessionRecord(store, sampleRecord, new Date('2026-09-01T00:00:00.000Z'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('CLT-1');
      expect(result.error).toContain('storage is full');
    }

    const log = getPersistenceAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ action: 'save', clientId: 'CLT-1', ok: false, error: 'storage is full' });
  });
});
