import { logProductRecommendation } from './logProductRecommendation';
import type { ClientProfile } from './clientProfile';
import type { Opportunity, ReasoningEntry } from './opportunity';
import type { Product } from './product';
import type { ProductRecommendationResult } from './productRecommendation';

interface ScoredProduct {
  product: Product;
  score: number;
  reasoning: ReasoningEntry[];
}

function scoreProductRelevance(client: ClientProfile, product: Product): ScoredProduct {
  const reasoning: ReasoningEntry[] = [];
  let score = 0;

  if (client.preferences.preferredCategories.includes(product.category)) {
    score += 30;
    reasoning.push({ factor: 'category_match', detail: `Matches preferred category '${product.category}'.`, weight: 30 });
  }
  if (client.preferences.preferredHouses.includes(product.house)) {
    score += 40;
    reasoning.push({ factor: 'house_match', detail: `Matches preferred house '${product.house}'.`, weight: 40 });
  }
  if (product.isNewArrival) {
    score += 15;
    reasoning.push({ factor: 'new_arrival', detail: `'${product.name}' is a new arrival.`, weight: 15 });
  }

  return { product, score, reasoning };
}

function pickBest(scored: ScoredProduct[]): ScoredProduct {
  return [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.product.id.localeCompare(b.product.id);
  })[0];
}

/**
 * Recommends the catalog product most relevant to a client's preferences for an
 * identified opportunity. Independent of any productId the opportunity may already
 * carry — this is its own auditable recommendation, logged via logProductRecommendation.
 */
export function recommendProduct(
  opportunity: Opportunity,
  client: ClientProfile,
  catalog: Product[],
  now: Date = new Date(),
): ProductRecommendationResult {
  if (!opportunity) {
    return { ok: false, error: 'No opportunity was provided to recommend a product for.' };
  }
  if (opportunity.clientId !== client.id) {
    return {
      ok: false,
      error: `Opportunity belongs to client '${opportunity.clientId}', not '${client.id}'.`,
    };
  }
  if (!Array.isArray(catalog)) {
    return { ok: false, error: 'Product catalog not loaded.' };
  }
  if (catalog.length === 0) {
    return { ok: false, error: 'Product catalog is empty — no products available to recommend.' };
  }

  const scored = catalog.map((product) => scoreProductRelevance(client, product)).filter((s) => s.score > 0);
  if (scored.length === 0) {
    return {
      ok: false,
      error: `No product in the catalog matches client '${client.id}''s preferences.`,
    };
  }

  const best = pickBest(scored);

  const recommendation = {
    clientId: client.id,
    opportunityType: opportunity.type,
    productId: best.product.id,
    productName: best.product.name,
    score: best.score,
  };

  logProductRecommendation({
    clientId: client.id,
    loggedAt: now.toISOString(),
    recommendation,
    reasoning: best.reasoning,
  });

  return { ok: true, recommendation, reasoning: best.reasoning };
}
