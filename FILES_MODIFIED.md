# FILES MODIFIED — STAGE 1: SECURITY & PAYMENT PROTECTION

**Branch:** `audit-remediation-stage1`  
**Base Commit:** `887d80d5047825d2b14a06e493473d5fbe777ee3`  
**Execution Timestamp:** 2026-11-06  

---

## Complete List of Modified Files

| File Path | Component | Changes Made | Lines Affected |
|---|---|---|---|
| [`backend/src/routes/coupons.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/coupons.ts) | Backend Router | Added RBAC protection to coupon CRUD (`OWNER`, `ORDER_MANAGER`); split `GET /coupons` for admin vs public active coupons; added `PUT` & `DELETE` routes; added usage limit check. | 1–134 |
| [`backend/src/routes/payments.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/payments.ts) | Payment Webhook | Enforced mandatory HMAC verification (fail closed on missing secret); added safe buffer length equality check; integrated `markOrderPaid` for idempotent status updates; handled `payment.failed`. | 241–310 |
| [`backend/src/routes/customers.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/customers.ts) | Customers API | Removed `STAFF` role from `GET /customers` and `GET /customers/:id` to protect customer PII under the principle of least privilege. | 19–23, 60–64 |
| [`backend/src/middleware/auth.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/middleware/auth.ts) | Auth Middleware | Exported `extractAuthToken(req)` helper to support dual-mode (optional auth) endpoints. | 27–37 |
| [`backend/src/utils/checkout.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/utils/checkout.ts) | Checkout Logic | Added defense-in-depth `usageLimit` validation during backend checkout order calculation. | 207–211 |
| [`backend/src/app.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/app.ts) | Express App | Configured environment-aware CORS with explicit origin allowlist, preserving non-browser requests (webhooks/cURL/tests). | 4, 24–54 |
| [`backend/src/config/env.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/config/env.ts) | Environment Config | Added `env.appUrl` export; corrected fallback fromEmail domain from `gurudaimonds.in` to `gurudiamonds.in`. | 10, 15 |
| [`.env`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/.env) | Environment Config | Corrected typos in `APP_URL` and `FROM_EMAIL` to canonical `gurudiamonds.in`. (No secrets exposed or committed). | 1, 7 |
| [`tests/api/commerce.test.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/tests/api/commerce.test.ts) | API Test Suite | Added authentication to `POST /api/coupons` test; added unauthenticated and STAFF denial assertions. | 30–42 |
| [`tests/security/security.test.ts`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/tests/security/security.test.ts) | Security Test Suite | Added 7 security regression tests for coupon auth, customer PII protection, webhook fail-closed behavior, buffer comparison safety, and CORS. | 44–91 |

---

## Git Change Verification

```
git status -s (Stage 1 delta):
 M backend/src/app.ts
 M backend/src/config/env.ts
 M backend/src/middleware/auth.ts
 M backend/src/routes/coupons.ts
 M backend/src/routes/customers.ts
 M backend/src/routes/payments.ts
 M backend/src/utils/checkout.ts
 M tests/api/commerce.test.ts
 M tests/security/security.test.ts
```

*(Pre-existing working tree modifications in `src/` and untracked assets have been completely preserved and remain untouched).*

