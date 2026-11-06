# IMPLEMENTATION CHANGES — STAGE 1: SECURITY & PAYMENT PROTECTION

**Date:** 2026-11-06  
**Branch:** `audit-remediation-stage1`  
**Status:** ✅ **STAGE 1 COMPLETE — ALL TESTS PASSED**

---

## 1. Coupon Authorization & Public Storefront Separation

### Original Vulnerability
`POST /api/coupons` and `GET /api/coupons` lacked authentication and role authorization middleware. Any anonymous visitor or malicious actor could query internal coupons, create 100% discount codes, or overwrite existing coupons without restriction.

### Root Cause
Missing `requireAuth` and `requireRole(...)` guards on `couponsRouter`, with no distinction between administrative coupon management and public storefront coupon hydration/validation.

### Exact Files Changed
* [`backend/src/routes/coupons.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/coupons.ts)
* [`backend/src/middleware/auth.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/middleware/auth.ts)
* [`backend/src/utils/checkout.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/utils/checkout.ts)

### Summary of Implementation
1. **Administrative Operations Guarded:** Added `requireRole('OWNER', 'ORDER_MANAGER')` to `POST /api/coupons`, `PUT /api/coupons/:id`, and `DELETE /api/coupons/:id`.
2. **Payload Validation:** Enforced required fields (`code`, `discountType`, `discountValue`) before processing mutations.
3. **Dual-Mode `GET /api/coupons`:**
   * Utilized `extractAuthToken(req)`: if authenticated with `OWNER`, `ORDER_MANAGER`, or `SUPER_ADMIN`, returns all coupons (active, draft, expired).
   * For unauthenticated visitors and customers, filters exclusively by `active: true`, `startDate <= now`, and `endDate >= now`.
4. **Usage Limit Checks:** Added `usageLimit > 0 && usedCount >= usageLimit` verification in both `POST /api/coupons/validate` and `backend/src/utils/checkout.ts`.
5. **Checkout Functionality Preserved:** Public storefront coupon validation (`POST /api/coupons/validate`) and `useCartStore.hydrateCoupons()` remain fully operational.

### Tests Executed
* `POST /api/coupons denies unauthenticated requests` $\to$ **PASS** (HTTP 401)
* `POST /api/coupons denies STAFF` $\to$ **PASS** (HTTP 403)
* `POST /api/coupons creates or updates a coupon for ORDER_MANAGER` $\to$ **PASS** (HTTP 201)
* `POST /api/coupons/validate accepts a valid coupon` $\to$ **PASS** (HTTP 200)
* `POST /api/coupons/validate rejects invalid coupon IDs` $\to$ **PASS** (HTTP 404)
* `POST /api/coupons/validate rejects exceeded usage limit` $\to$ **PASS** (HTTP 400)

### Regression Risks
Low. Storefront cart hydration uses public active coupons; authenticated checkout recalculates discounts independently in `backend/src/utils/checkout.ts`.

### Deployment Dependencies
None. Existing seeded coupons continue to function.

### Rollback Instructions
Revert [`backend/src/routes/coupons.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/coupons.ts) to commit `887d80d`.

---

## 2. Razorpay Webhook Mandatory Fail-Closed Protection

### Original Vulnerability
`POST /api/payments/webhook/razorpay` skipped signature verification entirely whenever `RAZORPAY_WEBHOOK_SECRET` was empty, falsy, or missing. Attackers could forge a `payment.captured` event to mark unpaid orders as `PAID`. Furthermore, mismatched signature lengths threw unhandled `RangeError` exceptions from `crypto.timingSafeEqual`.

### Root Cause
An optional `if (env.razorpayWebhookSecret)` conditional surrounded the verification check rather than enforcing mandatory verification and failing closed.

### Exact Files Changed
* [`backend/src/routes/payments.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/payments.ts)

### Summary of Implementation
1. **Mandatory Fail-Closed:** If `!env.razorpayWebhookSecret`, the endpoint immediately throws `HttpError(500, 'Razorpay webhook signature verification is not configured')`.
2. **Missing Signature Check:** If `x-razorpay-signature` header is absent, immediately throws `HttpError(400, 'Missing webhook signature')`.
3. **Safe Timing-Attack Comparison:** Calculated HMAC SHA-256 digest buffer and compared buffer lengths prior to `crypto.timingSafeEqual`, preventing unhandled runtime `RangeError` exceptions.
4. **Malformed Payload Rejection:** Enclosed JSON payload parsing in a safe try-catch, rejecting invalid JSON with HTTP 400.
5. **Idempotency & Lifecycle Consistency:**
   * When `payment.captured` arrives, verifies matching order.
   * If already `PAID`, skips duplicate processing.
   * If unpaid, executes `markOrderPaid(tx, order, ...)` inside a database transaction, transitioning status to `CONFIRMED`, decrementing inventory, and updating customer statistics.
   * Added handling for `payment.failed` to mark payment status as `FAILED`.

### Tests Executed
* `webhook fails closed when signature is missing` $\to$ **PASS** (HTTP 400/500)
* `webhook rejects malformed signature without unhandled RangeError` $\to$ **PASS** (HTTP 400/500)
* `order immutability and payment verification suites` $\to$ **PASS**

### Regression Risks
Low. Legitimate Razorpay webhooks signed with the configured secret continue to be verified and processed.

### Deployment Dependencies
`RAZORPAY_WEBHOOK_SECRET` must be set in the production hosting dashboard (e.g., Render) matching the secret configured in the Razorpay Webhook Dashboard.

### Rollback Instructions
Revert [`backend/src/routes/payments.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/payments.ts) to commit `887d80d`.

---

## 3. Customer Data Protection & Least Privilege

### Original Vulnerability
`GET /api/customers` and `GET /api/customers/:id` permitted the `STAFF` role, leaking customer PII (full legal names, email addresses, phone numbers, delivery addresses, and past order history) to internal staff accounts.

### Root Cause
Overly permissive role array in `requireRole('OWNER', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'STAFF', 'FINANCE')`.

### Exact Files Changed
* [`backend/src/routes/customers.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/customers.ts)

### Summary of Implementation
1. Removed `'STAFF'` from `customersRouter.get('/customers', ...)`. Allowed roles: `'OWNER'`, `'ORDER_MANAGER'`, `'PRODUCT_MANAGER'`, `'FINANCE'`.
2. Removed `'STAFF'` from `customersRouter.get('/customers/:id', ...)`. Allowed roles: `'OWNER'`, `'ORDER_MANAGER'`, `'PRODUCT_MANAGER'`, `'FINANCE'`.
3. Preserved required administrative and financial workflows while strictly enforcing the principle of least privilege.

### Tests Executed
* `GET /api/customers denies STAFF` $\to$ **PASS** (HTTP 403)
* `protects customer PII by ID from STAFF role` $\to$ **PASS** (HTTP 403)
* `GET /api/customers lists customers for ORDER_MANAGER` $\to$ **PASS** (HTTP 200)

### Regression Risks
Zero. Staff accounts do not require bulk customer address and contact data exports.

### Deployment Dependencies
None.

### Rollback Instructions
Revert [`backend/src/routes/customers.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/customers.ts) to commit `887d80d`.

---

## 4. Environment-Aware CORS Policy

### Original Vulnerability
`backend/src/app.ts` utilized `app.use(cors())`, allowing wildcard `*` origins from any arbitrary malicious third-party website.

### Root Cause
Default unconfigured CORS middleware.

### Exact Files Changed
* [`backend/src/app.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/app.ts)
* [`backend/src/config/env.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/config/env.ts)

### Summary of Implementation
1. Configured explicit allowed origins:
   * Production: Canonical `APP_URL`, `https://gurudiamonds.in`, `https://www.gurudiamonds.in`.
   * Development: Localhost origins (`http://localhost:3000`, `http://localhost:5000`, `http://localhost:5055`, `http://127.0.0.1:3000`, `http://127.0.0.1:5000`, `http://127.0.0.1:5055`).
2. Preserved non-browser requests (`!origin`) so Razorpay server-to-server webhooks, cURL calls, and automated test runners are never blocked.
3. Reject unauthorized browser origins with HTTP 403 (`CORS policy: origin ... is not allowed`).

### Tests Executed
* `enforces CORS policy against unauthorized third-party origins` $\to$ **PASS** (HTTP 403)
* Non-origin webhook and API calls $\to$ **PASS** (HTTP 200)

### Regression Risks
Low. Ensure any future custom storefront domains are added to `APP_URL` or allowed origins list.

### Deployment Dependencies
Set `APP_URL` in production environment settings.

### Rollback Instructions
Revert [`backend/src/app.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/app.ts) to commit `887d80d`.

---

## 5. Payment Environment Isolation & Credential Security

### Finding & Observation
The development `.env` contained live Razorpay production keys (`rzp_live_...`).

### Action Taken
1. **Credentails Not Printed or Stored:** In strict compliance with security rules, no secrets have been printed, exposed, or committed to source control.
2. **Rotation Required:** Flagged the live key for immediate rotation in the Razorpay Dashboard to prevent any compromise.
3. **Sandbox Documentation:** Verified that [`.env.example`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/.env.example) guides developers to use sandbox test credentials (`rzp_test_xxxx`).
4. **Safe Local Mode:** Production transactions are strictly blocked in development mode.

---

## 6. Domain and Email Configuration Alignment

### Original Flaw
Domain typos existed across configuration files:
* `APP_URL="https://gurudimonds.in"` (missing 'a')
* `FROM_EMAIL="info@gurudaimonds.in"` (misspelled 'daimonds')

### Action Taken
* Corrected canonical domain to `https://gurudiamonds.in` in [`.env`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/.env).
* Corrected sender email to `info@gurudiamonds.in` in [`.env`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/.env) and fallback in [`backend/src/config/env.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/config/env.ts).

