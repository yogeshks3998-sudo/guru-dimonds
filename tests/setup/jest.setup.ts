import '@testing-library/jest-dom';
import { beforeEach, jest as jestGlobals } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'node:util';
import { setImmediate } from 'node:timers';

process.env.JWT_SECRET ||= 'jest-test-secret-with-enough-length';
process.env.DATABASE_URL ||= 'postgresql://postgres:Abcd%40123@localhost:5432/gurudimonds?schema=public';
process.env.VITE_API_URL ||= 'http://localhost:5000/api';

Object.assign(globalThis, { TextDecoder, TextEncoder });
Object.assign(globalThis, { jest: jestGlobals });
Object.assign(globalThis, { setImmediate });

const createStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: jestGlobals.fn((key: string) => store[key] ?? null),
    setItem: jestGlobals.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jestGlobals.fn((key: string) => {
      delete store[key];
    }),
    clear: jestGlobals.fn(() => {
      store = {};
    }),
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.assign(globalThis, { localStorage: createStorageMock() });
}

if (typeof globalThis.sessionStorage === 'undefined') {
  Object.assign(globalThis, { sessionStorage: createStorageMock() });
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jestGlobals.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jestGlobals.fn(),
      removeListener: jestGlobals.fn(),
      addEventListener: jestGlobals.fn(),
      removeEventListener: jestGlobals.fn(),
      dispatchEvent: jestGlobals.fn(),
    })),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class ResizeObserver {
      observe = jestGlobals.fn();
      unobserve = jestGlobals.fn();
      disconnect = jestGlobals.fn();
    },
  });

  window.scrollTo = jestGlobals.fn();
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  global.fetch = jestGlobals.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({ message: 'Test fetch not mocked' }),
  } as Response);
  jestGlobals.useRealTimers();
});
