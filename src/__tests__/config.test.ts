import { describe, expect, test } from 'bun:test';
import { ConfigSchema, defaultConfig } from '../config/schema.js';

describe('default configuration', () => {
  test('matches the public config schema', () => {
    expect(() => ConfigSchema.parse(defaultConfig)).not.toThrow();
  });
});
