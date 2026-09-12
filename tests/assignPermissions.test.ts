import { describe, expect, it } from 'vitest';
import { assignPermissions } from '../src/assignPermissions';

describe('assignPermissions', () => {
  it('grants an advisor only its least-privilege permissions', () => {
    const result = assignPermissions('advisor');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.permissions).toEqual(['view_client_data', 'generate_recommendations', 'queue_messages']);
    }
  });

  it('allows requesting a subset of permissions the role already has', () => {
    const result = assignPermissions('advisor', ['view_client_data']);
    expect(result.ok).toBe(true);
  });

  it('rejects an unknown role as a role assignment error', () => {
    const result = assignPermissions('client');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('Unknown role');
    }
  });

  it('rejects a role requesting a permission outside the master catalog', () => {
    const result = assignPermissions('advisor', ['delete_everything']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('does not exist in the permission catalog');
    }
  });

  it('blocks permission escalation beyond a role\'s granted set', () => {
    const result = assignPermissions('advisor', ['manage_roles']);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('permission escalation blocked');
    }
  });
});
