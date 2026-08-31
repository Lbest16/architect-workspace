import type { OpportunityType } from './opportunity';

export interface OutreachMessage {
  clientId: string;
  opportunityType: OpportunityType;
  productId: string | null;
  subject: string;
  body: string;
  characterCount: number;
  generatedAt: string;
}

export type MessageGenerationResult =
  | { ok: true; message: OutreachMessage }
  | { ok: false; error: string };
