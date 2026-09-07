export interface SecurityAlertEntry {
  clientId: string;
  alertedAt: string;
  reason: string;
}

const alertLog: SecurityAlertEntry[] = [];

/** Append-only alert trail for the security team: every detected privacy-breach attempt lands here. */
export function logSecurityAlert(entry: SecurityAlertEntry): void {
  alertLog.push(entry);
}

export function getSecurityAlertLog(): readonly SecurityAlertEntry[] {
  return alertLog;
}

export function clearSecurityAlertLog(): void {
  alertLog.length = 0;
}
