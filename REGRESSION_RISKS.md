# REGRESSION RISKS & MITIGATION ANALYSIS — STAGE 1

**Date:** 2026-11-06  
**Branch:** `audit-remediation-stage1`  

---

## 1. Identified Risks and Mitigation Strategies

### Risk 1: Storefront Cart Coupon Hydration Failure
* **Risk Description:** If `GET /api/coupons` required strict admin authentication, public shoppers loading the homepage or cart drawer would receive HTTP 401/403, breaking coupon code autofill or discount calculations.
* **Mitigation Implemented:** Implemented dual-mode resolution via `extractAuthToken(req)`:
  * When an unauthenticated visitor or customer queries `GET /api/coupons`, the endpoint returns active, non-expired coupons (`active: true, startDate <= now, endDate >= now`).
  * When an admin queries, all coupons (draft, expired, active) are returned.
  * Storefront hydration (`useCartStore.hydrateCoupons`) continues to succeed with HTTP 200 without leaking administrative promotional data.
* **Verification:** Vitest cart tests and API commerce tests confirmed passing.

---

### Risk 2: Webhook Processing Interruption Due to Missing Secret
* **Risk Description:** Enforcing mandatory HMAC verification could cause valid Razorpay webhook callbacks to return HTTP 500 if the server environment lacks `RAZORPAY_WEBHOOK_SECRET`.
* **Mitigation Implemented:**
  * Endpoint correctly fails closed with clear error messaging: `HttpError(500, 'Razorpay webhook signature verification is not configured')`.
  * Order status transitions cannot be spoofed by unauthenticated requests.
  * Documented `RAZORPAY_WEBHOOK_SECRET` as a mandatory deployment prerequisite in [`DEPLOYMENT_IMPACT.md`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/DEPLOYMENT_IMPACT.md).

---

### Risk 3: Third-Party Integration and Webhook Delivery Blocked by CORS
* **Risk Description:** Restricting CORS to a strict origin allowlist could inadvertently block Razorpay server-to-server webhook delivery, mobile apps, or backend API tests.
* **Mitigation Implemented:** Configured CORS middleware to explicitly allow non-browser requests (`if (!origin) callback(null, true);`). Server-to-server HTTP POST requests do not send an `Origin` header and are permitted through, while unauthorized browser cross-origin requests are rejected with HTTP 403.
* **Verification:** Security regression tests confirmed passing.

---

### Risk 4: Staff Workflow Disruption
* **Risk Description:** Removing `STAFF` from `GET /api/customers` could impact staff users if their daily tasks included reviewing customer records.
* **Mitigation Implemented:** Role evaluation confirmed that order fulfillment staff interact with orders via `/api/orders` (which provides shipping addresses necessary for packing slips), while bulk customer PII downloads are appropriately restricted to `OWNER`, `ORDER_MANAGER`, and `FINANCE`.
* **Verification:** `tests/api/commerce.test.ts` confirmed `ORDER_MANAGER` retains customer listing access.

---

### Risk 5: Webhook Signature Length Mismatch Runtime Exception
* **Risk Description:** If an attacker sends a signature string whose byte length does not match the HMAC SHA-256 digest (e.g. 10 characters vs 64 characters), Node.js `crypto.timingSafeEqual` throws an unhandled `RangeError: Input buffers must have the same length`, causing an unhandled server crash.
* **Mitigation Implemented:** Checked `expectedBuf.length !== signatureBuf.length` before invoking `crypto.timingSafeEqual`. Mismatched signatures are immediately rejected with HTTP 400 Bad Request.
* **Verification:** Added explicit regression test in `tests/security/security.test.ts` (`webhook rejects malformed signature without unhandled RangeError`), which passed cleanly.

