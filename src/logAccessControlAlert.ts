export interface AccessControlAlertEntry {
  role: string;
  alertedAt: string;
  reason: string;
}

const alertLog: AccessControlAlertEntry[] = [];

/** Append-only alert trail for the admin: every denied or misconfigured access control attempt lands here. */
export function logAccessControlAlert(entry: AccessControlAlertEntry): void {
  alertLog.push(entry);
}

export function getAccessControlAlertLog(): readonly AccessControlAlertEntry[] {
  return alertLog;
}

export function clearAccessControlAlertLog(): void {
  alertLog.length = 0;
}
