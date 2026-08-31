import type { OpportunityType, ReasoningEntry } from './opportunity';

export interface ProductRecommendation {
  clientId: string;
  opportunityType: OpportunityType;
  productId: string;
  productName: string;
  score: number;
}

export type ProductRecommendationResult =
  | { ok: true; recommendation: ProductRecommendation; reasoning: ReasoningEntry[] }
  | { ok: false; error: string };
