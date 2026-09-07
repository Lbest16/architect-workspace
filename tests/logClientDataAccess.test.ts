import { beforeEach, describe, expect, it } from 'vitest';
import { clearClientDataAccessLog, getClientDataAccessLog, logClientDataAccess } from '../src/logClientDataAccess';

beforeEach(() => clearClientDataAccessLog());

describe('logClientDataAccess', () => {
  it('starts empty', () => {
    expect(getClientDataAccessLog()).toHaveLength(0);
  });

  it('records an allowed access', () => {
    logClientDataAccess({ clientId: 'CLT-1', accessedAt: '2026-08-27T00:00:00.000Z', outcome: 'allowed' });

    const log = getClientDataAccessLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].outcome).toBe('allowed');
  });

  it('records a blocked access with a reason', () => {
    logClientDataAccess({ clientId: 'CLT-2', accessedAt: 't', outcome: 'blocked', reason: 'looks like real PII' });

    const log = getClientDataAccessLog();
    expect(log[0].outcome).toBe('blocked');
    expect(log[0].reason).toBe('looks like real PII');
  });

  it('accumulates one entry per call', () => {
    logClientDataAccess({ clientId: 'A', accessedAt: 't', outcome: 'allowed' });
    logClientDataAccess({ clientId: 'B', accessedAt: 't', outcome: 'allowed' });

    expect(getClientDataAccessLog()).toHaveLength(2);
  });

  it('clears the log', () => {
    logClientDataAccess({ clientId: 'A', accessedAt: 't', outcome: 'allowed' });
    clearClientDataAccessLog();
    expect(getClientDataAccessLog()).toHaveLength(0);
  });
});
