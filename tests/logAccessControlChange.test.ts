import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAccessControlLog,
  getAccessControlLog,
  logAccessControlChange,
} from '../src/logAccessControlChange';

describe('logAccessControlChange', () => {
  beforeEach(() => {
    clearAccessControlLog();
  });

  it('records a granted permission assignment', () => {
    logAccessControlChange({
      role: 'advisor',
      outcome: 'granted',
      changedAt: '2026-09-11T00:00:00.000Z',
      permissions: ['view_client_data'],
    });

    const log = getAccessControlLog();
    expect(log).toHaveLength(1);
    expect(log[0].outcome).toBe('granted');
  });

  it('records a denied assignment with its reason', () => {
    logAccessControlChange({
      role: 'client',
      outcome: 'denied',
      changedAt: '2026-09-11T00:00:00.000Z',
      reason: "Unknown role 'client' — no permissions can be assigned.",
    });

    const log = getAccessControlLog();
    expect(log).toHaveLength(1);
    expect(log[0].outcome).toBe('denied');
    expect(log[0].reason).toContain('Unknown role');
  });

  it('is append-only across multiple entries', () => {
    logAccessControlChange({ role: 'advisor', outcome: 'granted', changedAt: '2026-09-11T00:00:00.000Z' });
    logAccessControlChange({ role: 'security_admin', outcome: 'granted', changedAt: '2026-09-11T00:00:01.000Z' });

    expect(getAccessControlLog()).toHaveLength(2);
  });
});
