import type { OutreachMessage } from './message';

export interface MessageAuditEntry {
  clientId: string;
  loggedAt: string;
  message: OutreachMessage;
}

const auditLog: MessageAuditEntry[] = [];

/** Append-only audit trail so every generated outreach message stays inspectable. */
export function logMessageGeneration(entry: MessageAuditEntry): void {
  auditLog.push(entry);
}

export function getMessageAuditLog(): readonly MessageAuditEntry[] {
  return auditLog;
}

export function clearMessageAuditLog(): void {
  auditLog.length = 0;
}
