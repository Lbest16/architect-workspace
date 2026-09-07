import { beforeEach, describe, expect, it } from 'vitest';
import { clearSecurityAlertLog, getSecurityAlertLog, logSecurityAlert } from '../src/logSecurityAlert';

beforeEach(() => clearSecurityAlertLog());

describe('logSecurityAlert', () => {
  it('starts empty', () => {
    expect(getSecurityAlertLog()).toHaveLength(0);
  });

  it('records an alert with its reason', () => {
    logSecurityAlert({ clientId: 'real-customer-42', alertedAt: '2026-08-27T00:00:00.000Z', reason: 'id outside fictional pattern' });

    const log = getSecurityAlertLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('real-customer-42');
    expect(log[0].reason).toBe('id outside fictional pattern');
  });

  it('accumulates one entry per call', () => {
    logSecurityAlert({ clientId: 'A', alertedAt: 't', reason: 'r1' });
    logSecurityAlert({ clientId: 'B', alertedAt: 't', reason: 'r2' });

    expect(getSecurityAlertLog()).toHaveLength(2);
  });

  it('clears the log', () => {
    logSecurityAlert({ clientId: 'A', alertedAt: 't', reason: 'r1' });
    clearSecurityAlertLog();
    expect(getSecurityAlertLog()).toHaveLength(0);
  });
});
