import { assignPermissions } from './assignPermissions';
import { logAccessControlChange } from './logAccessControlChange';
import { logAccessControlAlert } from './logAccessControlAlert';
import type { Permission } from './role';

export type AccessCheckResult = { ok: true } | { ok: false; reason: string };

/**
 * Single choke point every permission check in the system must go through: resolves whether
 * a role holds the given permission, records the attempt in the access control audit log
 * (Trust criterion), and additionally alerts the admin when the attempt is denied — whether
 * that is an unrecognized role, an unconfigured role, or a permission escalation attempt.
 */
export function enforceAccessControl(role: string, permission: Permission, now: Date = new Date()): AccessCheckResult {
  const assignment = assignPermissions(role, [permission]);

  if (!assignment.ok) {
    logAccessControlChange({ role, outcome: 'denied', changedAt: now.toISOString(), reason: assignment.reason });
    logAccessControlAlert({ role, alertedAt: now.toISOString(), reason: assignment.reason });
    return { ok: false, reason: assignment.reason };
  }

  logAccessControlChange({ role, outcome: 'granted', changedAt: now.toISOString(), permissions: assignment.permissions });
  return { ok: true };
}
