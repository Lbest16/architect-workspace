import { describe, expect, it } from 'vitest';
import { initAdvisorApp } from '../src/initAdvisorApp';

describe('initAdvisorApp', () => {
  it('exports an entry point without touching the DOM at import time', () => {
    expect(typeof initAdvisorApp).toBe('function');
  });
});
