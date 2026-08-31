import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearMessageAuditLog,
  getMessageAuditLog,
  logMessageGeneration,
} from '../src/logMessageGeneration';
import type { OutreachMessage } from '../src/message';

const sampleMessage: OutreachMessage = {
  clientId: 'CLT-1',
  opportunityType: 'new_arrival_match',
  productId: 'PRD-1',
  subject: 'A new arrival for you',
  body: 'Thought of you when this landed.',
  characterCount: 'Thought of you when this landed.'.length,
  generatedAt: '2026-08-30T00:00:00.000Z',
};

describe('logMessageGeneration', () => {
  beforeEach(() => {
    clearMessageAuditLog();
  });

  it('starts empty', () => {
    expect(getMessageAuditLog()).toHaveLength(0);
  });

  it('appends an entry that can be read back', () => {
    logMessageGeneration({ clientId: 'CLT-1', loggedAt: '2026-08-30T00:00:00.000Z', message: sampleMessage });

    const log = getMessageAuditLog();
    expect(log).toHaveLength(1);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[0].message).toEqual(sampleMessage);
  });

  it('preserves append order across multiple entries', () => {
    logMessageGeneration({ clientId: 'CLT-1', loggedAt: '2026-08-30T00:00:00.000Z', message: sampleMessage });
    logMessageGeneration({ clientId: 'CLT-2', loggedAt: '2026-08-30T00:01:00.000Z', message: { ...sampleMessage, clientId: 'CLT-2' } });

    const log = getMessageAuditLog();
    expect(log).toHaveLength(2);
    expect(log[0].clientId).toBe('CLT-1');
    expect(log[1].clientId).toBe('CLT-2');
  });

  it('clearMessageAuditLog empties the log', () => {
    logMessageGeneration({ clientId: 'CLT-1', loggedAt: '2026-08-30T00:00:00.000Z', message: sampleMessage });
    clearMessageAuditLog();

    expect(getMessageAuditLog()).toHaveLength(0);
  });
});
