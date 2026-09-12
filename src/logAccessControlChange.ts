import type { Permission } from './role';

export type AccessControlChangeOutcome = 'granted' | 'denied';

export interface AccessControlChangeEntry {
  role: string;
  outcome: AccessControlChangeOutcome;
  changedAt: string;
  permissions?: readonly Permission[];
  reason?: string;
}

const accessControlLog: AccessControlChangeEntry[] = [];

/** Append-only audit trail of every role/permission assignment attempt, granted or denied. */
export function logAccessControlChange(entry: AccessControlChangeEntry): void {
  accessControlLog.push(entry);
}

export function getAccessControlLog(): readonly AccessControlChangeEntry[] {
  return accessControlLog;
}

export function clearAccessControlLog(): void {
  accessControlLog.length = 0;
}
