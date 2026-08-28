import { logOpportunityReasoning } from './logOpportunityReasoning';
import { scoreOpportunities } from './scoreOpportunities';
import type { OpportunityCandidate } from './scoreOpportunities';
import { validateClientData } from './validateClientData';
import type { OpportunityResult } from './opportunity';
import type { Product } from './product';

function pickStrongest(candidates: OpportunityCandidate[]): OpportunityCandidate {
  return [...candidates].sort((a, b) => {
    if (b.opportunity.score !== a.opportunity.score) return b.opportunity.score - a.opportunity.score;
    if (a.opportunity.type !== b.opportunity.type) return a.opportunity.type.localeCompare(b.opportunity.type);
    return (a.opportunity.productId ?? '').localeCompare(b.opportunity.productId ?? '');
  })[0];
}

/**
 * Identifies the strongest clienteling opportunity for one client from their profile,
 * purchase history, and preferences, weighed against the product catalog. Every
 * successful identification is logged with its reasoning via logOpportunityReasoning.
 */
export function identifyOpportunity(rawClient: unknown, catalog: Product[], now: Date = new Date()): OpportunityResult {
  const validation = validateClientData(rawClient);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const candidates = scoreOpportunities(validation.data, catalog, now);
  if (candidates.length === 0) {
    return {
      ok: false,
      error: `No clienteling opportunity could be identified for client '${validation.data.id}' — no catalog matches their preferences and no re-engagement signal was found.`,
    };
  }

  const strongest = pickStrongest(candidates);

  logOpportunityReasoning({
    clientId: validation.data.id,
    loggedAt: now.toISOString(),
    opportunity: strongest.opportunity,
    reasoning: strongest.reasoning,
  });

  return { ok: true, opportunity: strongest.opportunity, reasoning: strongest.reasoning };
}
