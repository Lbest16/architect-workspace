import { describe, expect, it } from 'vitest';
import type { MessageGenerationResult, OutreachMessage } from '../src/message';

describe('OutreachMessage shape', () => {
  it('accepts a fully-formed outreach message', () => {
    const message: OutreachMessage = {
      clientId: 'CLT-1',
      opportunityType: 'new_arrival_match',
      productId: 'PRD-1',
      subject: 'A new arrival for you',
      body: 'Thought of you when this landed.',
      characterCount: 'Thought of you when this landed.'.length,
      generatedAt: '2026-08-30T00:00:00.000Z',
    };

    expect(message.characterCount).toBe(message.body.length);
    expect(message.productId).toBe('PRD-1');
  });

  it('supports a message with no linked product', () => {
    const message: OutreachMessage = {
      clientId: 'CLT-2',
      opportunityType: 're_engagement',
      productId: null,
      subject: 'It has been a while',
      body: 'We would love to see you again.',
      characterCount: 32,
      generatedAt: '2026-08-30T00:00:00.000Z',
    };

    expect(message.productId).toBeNull();
  });

  it('supports both ok and error result variants', () => {
    const ok: MessageGenerationResult = {
      ok: true,
      message: {
        clientId: 'CLT-1',
        opportunityType: 'category_expansion',
        productId: 'PRD-9',
        subject: 's',
        body: 'b',
        characterCount: 1,
        generatedAt: '2026-08-30T00:00:00.000Z',
      },
    };
    const failed: MessageGenerationResult = { ok: false, error: 'missing data' };

    expect(ok.ok).toBe(true);
    expect(failed.ok).toBe(false);
  });
});
