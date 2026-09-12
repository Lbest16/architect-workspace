import { ALL_PERMISSIONS, ALL_ROLES, ROLE_PERMISSIONS } from './role';
import type { Permission, Role } from './role';

export type AssignPermissionsResult =
  | { ok: true; role: Role; permissions: readonly Permission[] }
  | { ok: false; reason: string };

/**
 * Resolves a role to its least-privilege permission set, catching misconfiguration before
 * anything downstream trusts the result: an unrecognized role, a role with no grants
 * configured, a requested permission outside the master catalog, or a requested permission
 * that role was never granted (permission escalation).
 */
export function assignPermissions(role: string, requestedPermissions?: readonly string[]): AssignPermissionsResult {
  if (!ALL_ROLES.includes(role as Role)) {
    return { ok: false, reason: `Unknown role '${role}' — no permissions can be assigned.` };
  }

  const grantedPermissions = ROLE_PERMISSIONS[role as Role];
  if (!grantedPermissions || grantedPermissions.length === 0) {
    return { ok: false, reason: `Role '${role}' has no permissions configured — access control misconfiguration.` };
  }

  for (const permission of requestedPermissions ?? []) {
    if (!ALL_PERMISSIONS.includes(permission as Permission)) {
      return { ok: false, reason: `Requested permission '${permission}' does not exist in the permission catalog.` };
    }
    if (!grantedPermissions.includes(permission as Permission)) {
      return {
        ok: false,
        reason: `Role '${role}' attempted to acquire '${permission}', which exceeds its least-privilege grant — permission escalation blocked.`,
      };
    }
  }

  return { ok: true, role: role as Role, permissions: grantedPermissions };
}
