import { daysBetween } from './daysBetween';
import type { ClientProfile } from './clientProfile';
import type { Opportunity, ReasoningEntry } from './opportunity';
import type { Product } from './product';

export interface OpportunityCandidate {
  opportunity: Opportunity;
  reasoning: ReasoningEntry[];
}

const RE_ENGAGEMENT_THRESHOLD_DAYS = 60;

function averagePurchasePrice(client: ClientProfile): number {
  if (client.purchaseHistory.length === 0) return 0;
  const total = client.purchaseHistory.reduce((sum, p) => sum + p.priceUsd, 0);
  return total / client.purchaseHistory.length;
}

function scoreProductMatch(client: ClientProfile, product: Product): OpportunityCandidate | null {
  const categoryMatch = client.preferences.preferredCategories.includes(product.category);
  const houseMatch = client.preferences.preferredHouses.includes(product.house);
  if (!categoryMatch && !houseMatch) return null;

  const reasoning: ReasoningEntry[] = [];
  let score = 0;

  if (categoryMatch) {
    score += 30;
    reasoning.push({ factor: 'category_match', detail: `Matches preferred category '${product.category}'.`, weight: 30 });
  }
  if (houseMatch) {
    score += 40;
    reasoning.push({ factor: 'house_match', detail: `Matches preferred house '${product.house}'.`, weight: 40 });
  }
  if (product.isNewArrival) {
    score += 15;
    reasoning.push({ factor: 'new_arrival', detail: `'${product.name}' is a new arrival.`, weight: 15 });
  }

  const purchasedCategories = new Set(client.purchaseHistory.map((p) => p.category));
  const isNewCategory = !purchasedCategories.has(product.category);
  if (isNewCategory) {
    score += 10;
    reasoning.push({
      factor: 'category_expansion',
      detail: `Client has not previously purchased in '${product.category}' — expands the relationship.`,
      weight: 10,
    });
  }

  const avgPrice = averagePurchasePrice(client);
  if (avgPrice > 0 && product.priceUsd <= avgPrice * 2 && product.priceUsd >= avgPrice * 0.25) {
    score += 10;
    reasoning.push({
      factor: 'spend_alignment',
      detail: `Price of $${product.priceUsd.toLocaleString()} aligns with the client's average purchase of $${avgPrice.toLocaleString()}.`,
      weight: 10,
    });
  }

  return {
    opportunity: {
      clientId: client.id,
      type: isNewCategory ? 'category_expansion' : 'new_arrival_match',
      productId: product.id,
      headline: `${product.name} (${product.house}) for ${client.name}`,
      score,
    },
    reasoning,
  };
}

function scoreReEngagement(client: ClientProfile, now: Date): OpportunityCandidate | null {
  const days = daysBetween(new Date(client.lastContactedOn), now);
  if (days < RE_ENGAGEMENT_THRESHOLD_DAYS) return null;

  const lifetimeSpend = client.purchaseHistory.reduce((sum, p) => sum + p.priceUsd, 0);
  const reasoning: ReasoningEntry[] = [
    {
      factor: 'contact_gap',
      detail: `${days} days since last contact (re-engagement threshold is ${RE_ENGAGEMENT_THRESHOLD_DAYS}).`,
      weight: Math.min(days, 100),
    },
  ];
  let score = Math.min(days, 100);

  if (lifetimeSpend > 0) {
    reasoning.push({
      factor: 'lifetime_spend',
      detail: `Lifetime spend of $${lifetimeSpend.toLocaleString()} warrants prioritized outreach.`,
      weight: 20,
    });
    score += 20;
  }

  return {
    opportunity: {
      clientId: client.id,
      type: 're_engagement',
      productId: null,
      headline: `Re-engage ${client.name} — ${days} days since last contact`,
      score,
    },
    reasoning,
  };
}

export function scoreOpportunities(client: ClientProfile, catalog: Product[], now: Date): OpportunityCandidate[] {
  const candidates: OpportunityCandidate[] = [];

  for (const product of catalog) {
    const candidate = scoreProductMatch(client, product);
    if (candidate) candidates.push(candidate);
  }

  const reEngagement = scoreReEngagement(client, now);
  if (reEngagement) candidates.push(reEngagement);

  return candidates;
}
