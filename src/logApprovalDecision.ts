export type ApprovalDecision = 'approved' | 'rejected';

export interface ApprovalDecisionEntry {
  draftId: string;
  decision: ApprovalDecision;
  approverId: string;
  decidedAt: string;
}

const approvalLog: ApprovalDecisionEntry[] = [];

/** Append-only audit trail so every approve/reject decision — and who made it — stays inspectable. */
export function logApprovalDecision(entry: ApprovalDecisionEntry): void {
  approvalLog.push(entry);
}

export function getApprovalAuditLog(): readonly ApprovalDecisionEntry[] {
  return approvalLog;
}

export function clearApprovalAuditLog(): void {
  approvalLog.length = 0;
}
