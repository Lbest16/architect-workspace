import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearPersistenceAuditLog,
  getPersistenceAuditLog,
  logPersistenceAction,
} from '../src/logPersistenceAction';

describe('logPersistenceAction', () => {
  beforeEach(() => {
    clearPersistenceAuditLog();
  });

  it('starts empty', () => {
    expect(getPersistenceAuditLog()).toHaveLength(0);
  });

  it('appends an entry that can be read back', () => {
    logPersistenceAction({ action: 'save', clientId: 'CLT-1', ok: true, error: null, loggedAt: '2026-09-01T00:00:00.000Z' });

    const log = getPersistenceAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('save');
    expect(log[0].ok).toBe(true);
  });

  it('preserves append order and records failures with their error', () => {
    logPersistenceAction({ action: 'save', clientId: 'CLT-1', ok: true, error: null, loggedAt: '2026-09-01T00:00:00.000Z' });
    logPersistenceAction({ action: 'load', clientId: 'CLT-2', ok: false, error: 'corrupted', loggedAt: '2026-09-01T00:01:00.000Z' });

    const log = getPersistenceAuditLog();
    expect(log).toHaveLength(2);
    expect(log[1].action).toBe('load');
    expect(log[1].ok).toBe(false);
    expect(log[1].error).toBe('corrupted');
  });

  it('clearPersistenceAuditLog empties the log', () => {
    logPersistenceAction({ action: 'save', clientId: 'CLT-1', ok: true, error: null, loggedAt: '2026-09-01T00:00:00.000Z' });
    clearPersistenceAuditLog();

    expect(getPersistenceAuditLog()).toHaveLength(0);
  });
});
