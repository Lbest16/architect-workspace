export type Permission =
  | 'view_client_data'
  | 'generate_recommendations'
  | 'queue_messages'
  | 'view_audit_logs'
  | 'manage_roles';

export const ALL_PERMISSIONS: readonly Permission[] = [
  'view_client_data',
  'generate_recommendations',
  'queue_messages',
  'view_audit_logs',
  'manage_roles',
];

export type Role = 'advisor' | 'security_admin' | 'system_admin';

export const ALL_ROLES: readonly Role[] = ['advisor', 'security_admin', 'system_admin'];

/**
 * Least-privilege grants per role. An advisor works the client pipeline but cannot see
 * audit logs or change roles; a security_admin can inspect audit logs but cannot touch
 * client data or messaging; a system_admin can manage roles but has no client-data or
 * messaging access either — no single role spans both client access and RBAC control.
 */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  advisor: ['view_client_data', 'generate_recommendations', 'queue_messages'],
  security_admin: ['view_audit_logs'],
  system_admin: ['manage_roles', 'view_audit_logs'],
};
