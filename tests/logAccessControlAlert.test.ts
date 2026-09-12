import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAccessControlAlertLog,
  getAccessControlAlertLog,
  logAccessControlAlert,
} from '../src/logAccessControlAlert';

describe('logAccessControlAlert', () => {
  beforeEach(() => {
    clearAccessControlAlertLog();
  });

  it('records an alert with its role and reason', () => {
    logAccessControlAlert({
      role: 'client',
      alertedAt: '2026-09-11T00:00:00.000Z',
      reason: "Unknown role 'client' — no permissions can be assigned.",
    });

    const log = getAccessControlAlertLog();
    expect(log).toHaveLength(1);
    expect(log[0].role).toBe('client');
    expect(log[0].reason).toContain('Unknown role');
  });

  it('is append-only across multiple alerts', () => {
    logAccessControlAlert({ role: 'advisor', alertedAt: '2026-09-11T00:00:00.000Z', reason: 'escalation attempt' });
    logAccessControlAlert({ role: 'advisor', alertedAt: '2026-09-11T00:00:01.000Z', reason: 'escalation attempt' });

    expect(getAccessControlAlertLog()).toHaveLength(2);
  });
});
