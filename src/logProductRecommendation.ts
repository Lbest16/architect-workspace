import type { ProductRecommendation } from './productRecommendation';
import type { ReasoningEntry } from './opportunity';

export interface ProductRecommendationAuditEntry {
  clientId: string;
  loggedAt: string;
  recommendation: ProductRecommendation;
  reasoning: ReasoningEntry[];
}

const auditLog: ProductRecommendationAuditEntry[] = [];

/** Append-only audit trail so the reasoning behind every product recommendation stays inspectable. */
export function logProductRecommendation(entry: ProductRecommendationAuditEntry): void {
  auditLog.push(entry);
}

export function getProductRecommendationAuditLog(): readonly ProductRecommendationAuditEntry[] {
  return auditLog;
}

export function clearProductRecommendationAuditLog(): void {
  auditLog.length = 0;
}
