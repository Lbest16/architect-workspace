import { describe, expect, it } from 'vitest';
import type { Opportunity, OpportunityResult, ReasoningEntry } from '../src/opportunity';

describe('Opportunity shape', () => {
  it('accepts a fully-formed opportunity and reasoning entry', () => {
    const reasoning: ReasoningEntry = { factor: 'house_match', detail: 'Matches preferred house.', weight: 40 };
    const opportunity: Opportunity = {
      clientId: 'CLT-1',
      type: 'new_arrival_match',
      productId: 'PRD-1',
      headline: 'Test opportunity',
      score: 40,
    };

    expect(opportunity.score).toBe(40);
    expect(reasoning.weight).toBe(40);
  });

  it('supports both ok and error result variants', () => {
    const ok: OpportunityResult = {
      ok: true,
      opportunity: { clientId: 'CLT-1', type: 're_engagement', productId: null, headline: 'h', score: 1 },
      reasoning: [],
    };
    const failed: OpportunityResult = { ok: false, error: 'missing data' };

    expect(ok.ok).toBe(true);
    expect(failed.ok).toBe(false);
  });
});
