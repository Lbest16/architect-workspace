import { describe, expect, it } from 'vitest';
import { projectMeta } from '../src/projectMeta';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe('projectMeta', () => {
  it('names the project and describes what it does', () => {
    expect(projectMeta.name).toBe('Luxury Client Intelligence Agent');
    expect(projectMeta.description.length).toBeGreaterThan(0);
  });

  it('carries valid ISO dates for demo day and build end', () => {
    expect(projectMeta.demoDayIso).toMatch(ISO_DATE);
    expect(projectMeta.buildEndIso).toMatch(ISO_DATE);
    expect(projectMeta.buildEndIso <= projectMeta.demoDayIso).toBe(true);
  });
});
