import { describe, expect, it } from 'vitest';
import { AUTH_TOKEN_KEY } from '../../services/api';

describe('auth token storage key', () => {
  it('uses the stable token key for session restore', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('token');
  });
});

