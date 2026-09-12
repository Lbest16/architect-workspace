import { beforeEach, describe, expect, it } from 'vitest';
import { enforceAccessControl } from '../src/enforceAccessControl';
import { clearAccessControlLog, getAccessControlLog } from '../src/logAccessControlChange';
import { clearAccessControlAlertLog, getAccessControlAlertLog } from '../src/logAccessControlAlert';

describe('enforceAccessControl', () => {
  beforeEach(() => {
    clearAccessControlLog();
    clearAccessControlAlertLog();
  });

  it('allows a role to use a permission it holds, and logs it as granted', () => {
    const result = enforceAccessControl('advisor', 'view_client_data');

    expect(result.ok).toBe(true);
    expect(getAccessControlLog()).toHaveLength(1);
    expect(getAccessControlLog()[0].outcome).toBe('granted');
    expect(getAccessControlAlertLog()).toHaveLength(0);
  });

  it('blocks an unauthorized role and alerts the admin', () => {
    const result = enforceAccessControl('client', 'view_client_data');

    expect(result.ok).toBe(false);
    expect(getAccessControlLog()).toHaveLength(1);
    expect(getAccessControlLog()[0].outcome).toBe('denied');
    expect(getAccessControlAlertLog()).toHaveLength(1);
    expect(getAccessControlAlertLog()[0].role).toBe('client');
  });

  it('blocks a permission escalation attempt and alerts the admin', () => {
    const result = enforceAccessControl('advisor', 'manage_roles');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('permission escalation blocked');
    }
    expect(getAccessControlAlertLog()).toHaveLength(1);
  });
});
