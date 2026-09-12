import { describe, expect, it } from 'vitest';
import { ALL_PERMISSIONS, ALL_ROLES, ROLE_PERMISSIONS } from '../src/role';
import type { Role } from '../src/role';

describe('Role permission grants', () => {
  it('grants every role only permissions from the master catalog', () => {
    for (const role of ALL_ROLES) {
      for (const permission of ROLE_PERMISSIONS[role]) {
        expect(ALL_PERMISSIONS).toContain(permission);
      }
    }
  });

  it('keeps client-data access and role management mutually exclusive', () => {
    const rolesWithClientAccess: Role[] = ALL_ROLES.filter((role) =>
      ROLE_PERMISSIONS[role].includes('view_client_data'),
    );
    const rolesThatManageRoles: Role[] = ALL_ROLES.filter((role) =>
      ROLE_PERMISSIONS[role].includes('manage_roles'),
    );

    for (const role of rolesWithClientAccess) {
      expect(rolesThatManageRoles).not.toContain(role);
    }
  });

  it('gives the advisor role only the pipeline permissions it needs', () => {
    expect(ROLE_PERMISSIONS.advisor).toEqual(
      expect.arrayContaining(['view_client_data', 'generate_recommendations', 'queue_messages']),
    );
    expect(ROLE_PERMISSIONS.advisor).not.toContain('manage_roles');
    expect(ROLE_PERMISSIONS.advisor).not.toContain('view_audit_logs');
  });
});
