export type OpportunityType = 'new_arrival_match' | 'category_expansion' | 're_engagement';

export interface Opportunity {
  clientId: string;
  type: OpportunityType;
  productId: string | null;
  headline: string;
  score: number;
}

export interface ReasoningEntry {
  factor: string;
  detail: string;
  weight: number;
}

export type OpportunityResult =
  | { ok: true; opportunity: Opportunity; reasoning: ReasoningEntry[] }
  | { ok: false; error: string };
