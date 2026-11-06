# TEST RESULTS — STAGE 1: SECURITY & PAYMENT PROTECTION

**Date:** 2026-11-06  
**Branch:** `audit-remediation-stage1`  
**Verdict:** ✅ **100% PASSING (ALL REQUIRED STAGE 1 SUITES)**

---

## 1. Test Execution Summary

| Test Suite File | Runner | Tests Executed | Passed | Failed | Skipped | Duration | Status |
|---|---|---|---|---|---|---|---|
| `tests/security/security.test.ts` | Jest | 13 | 13 | 0 | 0 | 8.42s | **PASS** |
| `tests/api/commerce.test.ts` | Jest | 16 | 16 | 0 | 0 | 26.68s | **PASS** |
| `tests/auth/authorization.test.ts` | Jest | 11 | 11 | 0 | 0 | 6.12s | **PASS** |
| `tests/auth/authentication.test.ts` | Jest | 5 | 5 | 0 | 0 | 5.80s | **PASS** |
| `tests/api/health.test.ts` | Jest | 2 | 2 | 0 | 0 | 6.33s | **PASS** |
| `tests/backend/order-lifecycle.test.ts` | Jest | 2 | 2 | 0 | 0 | 0.81s | **PASS** |
| `tests/integration/order-immutability.test.ts`| Jest | 2 | 2 | 0 | 0 | 20.49s | **PASS** |
| `tests/database/prisma.test.ts` | Jest | 7 | 7 | 0 | 0 | 6.10s | **PASS** |
| `vitest run` (5 test files) | Vitest | 10 | 10 | 0 | 0 | 6.08s | **PASS** |
| `tsc --noEmit` | TypeScript | N/A | N/A | 0 errors | 0 | 8.20s | **PASS** |
| `vite build` | Vite | 2341 modules | Built | 0 errors | 0 | 9.29s | **PASS** |
| `scripts/build-backend.mjs server` | esbuild | 1 bundle | Built | 0 errors | 0 | 1.80s | **PASS** |

---

## 2. Granular Security Regression Test Results (`tests/security/security.test.ts`)

```
PASS tests/security/security.test.ts (8.419 s)
  Security regression tests
    √ rejects missing JWT on sensitive customer data (106 ms)
    √ rejects invalid JWT on sensitive order data (26 ms)
    √ rejects role bypass attempts using CUSTOMER tokens (37 ms)
    √ handles SQL injection-like search payloads safely (3623 ms)
    √ handles XSS-like search payloads without reflecting executable markup (701 ms)
    √ protects product creation from unauthorized users (56 ms)
    √ protects metal-rate mutation from STAFF (30 ms)
    √ protects coupon creation from unauthorized users (25 ms)
    √ protects coupon creation from STAFF role (36 ms)
    √ protects customer PII by ID from STAFF role (19 ms)
    √ webhook fails closed when signature is missing (25 ms)
    √ webhook rejects malformed signature without unhandled RangeError (15 ms)
    √ enforces CORS policy against unauthorized third-party origins (18 ms)
```

---

## 3. Commerce & API Suite Results (`tests/api/commerce.test.ts`)

```
PASS tests/api/commerce.test.ts (26.685 s)
  Commerce APIs
    √ GET /api/coupons returns coupons (2246 ms)
    √ POST /api/coupons creates or updates a coupon for ORDER_MANAGER (538 ms)
    √ POST /api/coupons denies unauthenticated requests (37 ms)
    √ POST /api/coupons denies STAFF (23 ms)
    √ POST /api/coupons/validate accepts a valid coupon (812 ms)
    √ POST /api/coupons/validate rejects invalid coupon IDs (243 ms)
    √ POST /api/orders creates an order scaffold (5353 ms)
    √ GET /api/orders lists orders for OWNER (1428 ms)
    √ GET /api/orders/:id returns an order for FINANCE (950 ms)
    √ PATCH /api/orders/:id/status allows ORDER_MANAGER lifecycle updates (2375 ms)
    √ PATCH /api/orders/:id/status rejects invalid lifecycle transitions (2226 ms)
    √ GET /api/customers lists customers for ORDER_MANAGER (1452 ms)
    √ GET /api/customers denies STAFF (31 ms)
    √ GET /api/cms returns CMS content (494 ms)
    √ GET /api/metal-rates returns metal rates (723 ms)
    √ POST /api/metal-rates allows FINANCE (1961 ms)
```

---

## 4. Vitest Unit & Logic Results (`npm run test:vitest`)

```
 RUN  v4.1.10 C:/Users/Rakshitha/Downloads/Gurudiamonds

 ✓ src/utils/__tests__/pricing.test.ts (3 tests) 7ms
 ✓ src/utils/__tests__/orderLifecycle.test.ts (2 tests) 10ms
 ✓ src/stores/__tests__/authStore.test.ts (1 test) 7ms
 ✓ backend/src/utils/__tests__/checkout.test.ts (3 tests) 16ms
 ✓ src/stores/__tests__/cartStore.test.ts (1 test) 7ms

 Test Files  5 passed (5)
      Tests  10 passed (10)
   Duration  6.08s
```

---

## 5. Verification Commands Run

1. `npm run lint` $\to$ `tsc --noEmit` exited 0 (Zero type errors).
2. `npx jest tests/security/security.test.ts` $\to$ 13 passed, 13 total.
3. `npx jest tests/api/commerce.test.ts` $\to$ 16 passed, 16 total.
4. `npx jest tests/auth/authorization.test.ts tests/auth/authentication.test.ts tests/api/health.test.ts` $\to$ 18 passed, 18 total.
5. `npx jest tests/backend/order-lifecycle.test.ts tests/integration/order-immutability.test.ts` $\to$ 4 passed, 4 total.
6. `npx jest tests/database/prisma.test.ts` $\to$ 7 passed, 7 total.
7. `npm run test:vitest` $\to$ 10 passed, 10 total.
8. `npm run build` $\to$ Vite production build completed in 9.29s.
9. `npm run build:api` $\to$ esbuild server bundle created with 0 errors.

