# 03. ENVIRONMENT CONFIGURATION AUDIT

**Target:** `docs/audit/stage4-production-readiness/03_ENVIRONMENT_CONFIGURATION_AUDIT.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** Production DevOps Engineer & Site Reliability Engineer  
**Scope:** Full-Stack Topology, Hosting Platforms, and Secret Management  

---

## 1. Executive Summary & Topology

The Guru Diamonds production infrastructure consists of a decoupled multi-cloud architecture:
- **Frontend SPA:** Hosted on **Vercel** (`https://gurudiamonds.in`) serving static Vite-bundled assets.
- **Backend API:** Hosted on **Render** (`https://guru-dimonds.onrender.com`) running an Express Node.js 22 LTS container.
- **Database:** Hosted on **Neon Serverless PostgreSQL 16** with TLS 1.3 encryption.
- **Payment Gateway:** **Razorpay** India (Test Mode in staging, Live Mode in production).
- **Transactional Email:** **Brevo** (formerly Sendinblue) REST API with fallback to Resend / local logging.

---

## 2. Environment Variables Inventory & Status Matrix

*Note: Per strict security policy, no credentials, hashes, or secret keys are exposed.*

| Variable | Local | Staging | Production | Required | Validation Rule |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `NODE_ENV` | PRESENT | PRESENT | PRESENT | Yes | Must be `production` in live deployment |
| `PORT` | PRESENT | PRESENT | PRESENT | Yes | Numeric (e.g. `10000` on Render, `5000`/`5055` local) |
| `DATABASE_URL` | PRESENT | PRESENT | NOT VERIFIED | Yes | Valid PostgreSQL connection string with `sslmode=require` |
| `JWT_SECRET` | PRESENT | PRESENT | NOT VERIFIED | Yes | Min 32 characters; must not use default fallback |
| `APP_URL` | PRESENT | PRESENT | NOT VERIFIED | Yes | Must be `https://gurudiamonds.in` in production |
| `VITE_API_URL` | PRESENT | PRESENT | NOT VERIFIED | Yes | Must point to Render backend URL (e.g. `https://guru-dimonds.onrender.com/api`) |
| `RAZORPAY_KEY_ID` | PRESENT | PRESENT | NOT VERIFIED | Yes | Starts with `rzp_test_` (staging) or `rzp_live_` (prod) |
| `RAZORPAY_KEY_SECRET` | PRESENT | PRESENT | NOT VERIFIED | Yes | High-entropy secret key from Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET`| PRESENT | PRESENT | NOT VERIFIED | Yes | HMAC signing secret matching webhook endpoint |
| `EMAIL_PROVIDER` | PRESENT | PRESENT | NOT VERIFIED | Yes | Must be `brevo`, `resend`, or `smtp` |
| `FROM_EMAIL` | PRESENT | PRESENT | NOT VERIFIED | Yes | Valid domain email (e.g. `info@gurudiamonds.in`) |
| `FROM_NAME` | PRESENT | PRESENT | NOT VERIFIED | Yes | Brand display name (e.g. `Guru Diamonds`) |
| `BREVO_API_KEY` | PRESENT | PRESENT | NOT VERIFIED | Conditional | Required when `EMAIL_PROVIDER=brevo` |
| `RESEND_API_KEY` | PRESENT | PRESENT | NOT VERIFIED | Conditional | Required when `EMAIL_PROVIDER=resend` |
| `SMTP_HOST` | MISSING | MISSING | NOT APPLICABLE| Optional | Required only if `EMAIL_PROVIDER=smtp` |
| `SMTP_PORT` | PRESENT | PRESENT | NOT APPLICABLE| Optional | Defaults to 587 |
| `SMTP_USER` | MISSING | MISSING | NOT APPLICABLE| Optional | Required only if `EMAIL_PROVIDER=smtp` |
| `SMTP_PASS` | MISSING | MISSING | NOT APPLICABLE| Optional | Required only if `EMAIL_PROVIDER=smtp` |

---

## 3. Configuration & Isolation Analysis

### A. Razorpay Isolation & Live Payment Safety
1. **Live vs. Test Key Segregation:**
   - In local and staging `.env`, keys begin with `rzp_test_`.
   - In production, keys must begin with `rzp_live_`.
   - **Protection:** Razorpay's API immediately rejects requests where `key_id` begins with `rzp_test_` when connected to live customer cards, preventing accidental real charges during local development or test executions.
2. **Webhook Signature Enforcement:**
   - Webhook processing in `backend/src/routes/payments.ts` fails closed if `RAZORPAY_WEBHOOK_SECRET` is unset.
   - Timing-safe HMAC equality (`crypto.timingSafeEqual`) prevents side-channel timing attacks.

### B. Startup Validation & Fail-Closed Safety
- **Current Behavior:** `backend/src/config/env.ts` provides fallback strings for certain values (e.g. `jwtSecret: process.env.JWT_SECRET || 'change-this-before-production'`).
- **Production Vulnerability:** If `JWT_SECRET` is omitted on Render, the backend boots with the fallback string, weakening JWT token forgery resistance.
- **Required Hardening (P1):** Implement fail-fast startup assertions in `backend/src/server.ts` that immediately terminate execution with exit code 1 if `NODE_ENV === 'production'` and `DATABASE_URL`, `JWT_SECRET`, or `RAZORPAY_KEY_ID` are missing or default.

### C. Vercel SPA Routing & Proxying
- **Current `vercel.json`:**
  ```json
  {
    "rewrites": [
      {
        "source": "/((?!api/.*).*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Identified Gap:** Vercel rewrites direct requests for non-api paths to `/index.html`. If `VITE_API_URL` is omitted, the frontend assumes relative `/api`, which fails on Vercel unless a proxy rewrite to Render is added.
- **Recommendation:** Add explicit rewrite rules in `vercel.json` for `/sitemap.xml`, `/image-sitemap.xml`, and `/robots.txt` to proxy to the backend or serve verified static files from `dist/`.

### D. Render Web Service Configuration
- **Inspected `render.yaml`:**
  ```yaml
  buildCommand: npm ci && npm run db:generate && npm run db:deploy && npm run build:api
  startCommand: npm run start:api
  ```
- **Healthcheck Path:** Configured to `/api/health`. Verified returning HTTP 200 `{"ok":true,"service":"guru-diamonds-api"}`.
- **Database Deployment:** Auto-runs `npm run db:deploy` during build phase on Render, ensuring schema migrations apply before server start.
