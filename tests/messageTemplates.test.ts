import { describe, expect, it } from 'vitest';
import { findMessageTemplate } from '../src/messageTemplates';

describe('findMessageTemplate', () => {
  it('finds a template for each known opportunity type', () => {
    for (const type of ['new_arrival_match', 'category_expansion', 're_engagement']) {
      const result = findMessageTemplate(type);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.template.subject).toContain('{{clientName}}');
        expect(result.template.bodyTemplate).toContain('{{clientName}}');
      }
    }
  });

  it('returns a meaningful error for an unrecognized opportunity type', () => {
    const result = findMessageTemplate('not_a_real_type');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('not_a_real_type');
    }
  });

  it('returns a meaningful error for an empty opportunity type', () => {
    const result = findMessageTemplate('');

    expect(result.ok).toBe(false);
  });
});
