import { beforeEach, describe, expect, it } from 'vitest';
import { loadSessionRecord } from '../src/loadSessionRecord';
import { clearPersistenceAuditLog, getPersistenceAuditLog } from '../src/logPersistenceAction';
import type { KeyValueStore } from '../src/keyValueStore';
import type { SessionRecord } from '../src/sessionRecord';

const sampleRecord: SessionRecord = {
  clientId: 'CLT-1',
  subject: 'A new arrival for you',
  body: 'Thought of you when this landed.',
  queued: true,
  savedAt: '2026-09-01T00:00:00.000Z',
};

function memoryStore(seed: Record<string, string> = {}): KeyValueStore {
  const backing = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => backing.get(key) ?? null,
    setItem: (key, value) => backing.set(key, value),
    removeItem: (key) => backing.delete(key),
  };
}

describe('loadSessionRecord', () => {
  beforeEach(() => {
    clearPersistenceAuditLog();
  });

  it('returns null with no error when nothing has been saved yet', () => {
    const store = memoryStore();
    const result = loadSessionRecord(store, 'CLT-1', new Date('2026-09-01T00:00:00.000Z'));

    expect(result).toEqual({ ok: true, record: null });
    expect(getPersistenceAuditLog()[0]).toMatchObject({ action: 'load', ok: true, error: null });
  });

  it('returns the saved record when valid JSON is present', () => {
    const store = memoryStore({ 'advisor.session.CLT-1': JSON.stringify(sampleRecord) });
    const result = loadSessionRecord(store, 'CLT-1', new Date('2026-09-01T00:00:00.000Z'));

    expect(result).toEqual({ ok: true, record: sampleRecord });
  });

  it('returns a meaningful error and logs the failure when the stored value is corrupted', () => {
    const store = memoryStore({ 'advisor.session.CLT-1': '{not json' });
    const result = loadSessionRecord(store, 'CLT-1', new Date('2026-09-01T00:00:00.000Z'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('CLT-1');
      expect(result.error).toContain('corrupted');
    }
    expect(getPersistenceAuditLog()[0]).toMatchObject({ action: 'load', ok: false });
  });

  it('returns a meaningful error and logs the failure when the store throws on read', () => {
    const store: KeyValueStore = {
      getItem: () => {
        throw new Error('storage disabled');
      },
      setItem: () => {},
      removeItem: () => {},
    };

    const result = loadSessionRecord(store, 'CLT-1', new Date('2026-09-01T00:00:00.000Z'));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('storage disabled');
    }
    expect(getPersistenceAuditLog()[0]).toMatchObject({ action: 'load', ok: false, error: 'storage disabled' });
  });
});
