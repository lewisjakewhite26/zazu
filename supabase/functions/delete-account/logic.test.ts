import { describe, expect, it } from 'vitest';

import { extractBearerToken } from './logic';

describe('extractBearerToken', () => {
  it('extracts the token from a well-formed header', () => {
    expect(extractBearerToken('Bearer abc123')).toBe('abc123');
  });

  it('is case-insensitive on the scheme', () => {
    expect(extractBearerToken('bearer abc123')).toBe('abc123');
  });

  it('trims surrounding whitespace on the token', () => {
    expect(extractBearerToken('Bearer   abc123  ')).toBe('abc123');
  });

  it('returns null for a missing header', () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it('returns null for an empty header', () => {
    expect(extractBearerToken('')).toBeNull();
  });

  it('returns null for a non-Bearer scheme', () => {
    expect(extractBearerToken('Basic abc123')).toBeNull();
  });

  it('returns null for a Bearer header with no token', () => {
    expect(extractBearerToken('Bearer ')).toBeNull();
  });
});
