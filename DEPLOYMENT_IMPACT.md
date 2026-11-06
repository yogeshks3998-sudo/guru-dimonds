# DEPLOYMENT IMPACT & CONFIGURATION PREREQUISITES — STAGE 1

**Date:** 2026-11-06  
**Branch:** `audit-remediation-stage1`  

---

## 1. Environment Variable Requirements for Production

Before deploying the Stage 1 changes to the live production environment (e.g., on Render or Vercel), ensure the following environment variables are properly configured in the hosting provider's dashboard:

| Variable Name | Required Value / Format | Purpose | Action Required |
|---|---|---|---|
| `RAZORPAY_WEBHOOK_SECRET` | Secret string matching Razorpay Webhook settings | Enables mandatory cryptographic signature verification on incoming payment callbacks. | **CRITICAL:** Must be set in Render environment before deployment. Webhook fails closed (HTTP 500) if omitted. |
| `RAZORPAY_KEY_ID` | `rzp_live_...` (Production) / `rzp_test_...` (Staging) | Razorpay public key ID. | **CRITICAL ROTATION:** Rotate any live key that was previously placed in local `.env`. Ensure staging environments strictly use `rzp_test_...`. |
| `RAZORPAY_KEY_SECRET` | Secret string matching `RAZORPAY_KEY_ID` | Razorpay private secret key. | Keep secure; never expose to client bundles or git. |
| `APP_URL` | `https://gurudiamonds.in` | Canonical application URL used for CORS validation, SEO links, and email footers. | Verified and corrected from previous domain typo. |
| `FROM_EMAIL` | `info@gurudiamonds.in` | Verified Brevo/SMTP sender address. | Verified and corrected from previous domain typo. |

---

## 2. Infrastructure & Routing Impact

1. **CORS Allowlist Enforcement:**
   * Production traffic must originate from `https://gurudiamonds.in` or `https://www.gurudiamonds.in`.
   * If a custom preview deployment URL or staging domain is used (e.g. `https://guru-diamonds-staging.onrender.com`), it should be added to `APP_URL` or the allowed origins list in `backend/src/app.ts`.
2. **Webhook Endpoint URL:**
   * The webhook URL configured in the Razorpay Dashboard must point to:
     `https://gurudiamonds.in/api/payments/webhook/razorpay` (or `https://<render-backend>/api/payments/webhook/razorpay`).
   * Selected events in Razorpay Dashboard: `payment.captured`, `payment.failed`.

---

## 3. Rollback Procedure

If unexpected issues occur upon deployment of Stage 1:

1. **Immediate Git Rollback:**
   ```bash
   git checkout razorpay-test-payments
   # Or revert to base commit:
   git checkout 887d80d5047825d2b14a06e493473d5fbe777ee3
   ```
2. **File-Specific Rollback:**
   To roll back only individual endpoints without rolling back the entire branch:
   * Revert coupons: `git checkout 887d80d -- backend/src/routes/coupons.ts`
   * Revert webhook: `git checkout 887d80d -- backend/src/routes/payments.ts`
   * Revert CORS: `git checkout 887d80d -- backend/src/app.ts`
   * Revert customers: `git checkout 887d80d -- backend/src/routes/customers.ts`
3. **Database Impact:**
   Stage 1 does not execute schema migrations or destructive table changes. Rolling back application code requires **zero database rollbacks or schema restorations**.

