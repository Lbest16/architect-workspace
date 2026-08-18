import { describe, expect, it } from 'vitest';
import { init } from '../src/main';

describe('main', () => {
  it('exports an init entry point without touching the DOM at import time', () => {
    expect(typeof init).toBe('function');
  });
});
