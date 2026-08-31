import { beforeEach, describe, expect, it } from 'vitest';
import { clearAdvisorInteractionLog, getAdvisorInteractionLog, logAdvisorInteraction } from '../src/logAdvisorInteraction';

beforeEach(() => clearAdvisorInteractionLog());

describe('logAdvisorInteraction', () => {
  it('starts empty', () => {
    expect(getAdvisorInteractionLog()).toHaveLength(0);
  });

  it('records an entry', () => {
    logAdvisorInteraction({ type: 'navigation', detail: 'roster', loggedAt: '2026-08-31T00:00:00.000Z' });

    const log = getAdvisorInteractionLog();
    expect(log).toHaveLength(1);
    expect(log[0].type).toBe('navigation');
    expect(log[0].detail).toBe('roster');
  });

  it('accumulates one entry per call', () => {
    logAdvisorInteraction({ type: 'navigation', detail: 'roster', loggedAt: 't' });
    logAdvisorInteraction({ type: 'message_queued', detail: 'queued for CLT-1', loggedAt: 't' });

    expect(getAdvisorInteractionLog()).toHaveLength(2);
  });

  it('clears the log', () => {
    logAdvisorInteraction({ type: 'navigation', detail: 'roster', loggedAt: 't' });
    clearAdvisorInteractionLog();
    expect(getAdvisorInteractionLog()).toHaveLength(0);
  });
});
