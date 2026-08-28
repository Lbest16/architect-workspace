import type { Opportunity, ReasoningEntry } from './opportunity';

export interface OpportunityAuditEntry {
  clientId: string;
  loggedAt: string;
  opportunity: Opportunity;
  reasoning: ReasoningEntry[];
}

const auditLog: OpportunityAuditEntry[] = [];

/** Append-only audit trail so the reasoning behind every identified opportunity stays inspectable. */
export function logOpportunityReasoning(entry: OpportunityAuditEntry): void {
  auditLog.push(entry);
}

export function getOpportunityAuditLog(): readonly OpportunityAuditEntry[] {
  return auditLog;
}

export function clearOpportunityAuditLog(): void {
  auditLog.length = 0;
}
