# GURU DIAMONDS — PRODUCTION ENVIRONMENT CHECKLIST & MATRIX

**Repository:** `https://github.com/yogeshks3998-sudo/guru-dimonds`  
**Target Environments:** Render (API Backend) & Vercel (Storefront SPA)  
**Audit Stage:** Final Pre-Deployment Release Gate  
**Security Level:** Production Confidential  

---

## 1. Backend Environment Variables (Render Dashboard)

The backend Express application (`backend/src/server.ts` & `backend/src/config/env.ts`) executes strict fail-fast validation upon startup. If any required variable is missing or violates security constraints in production, the process will refuse to start.

| Variable Name | Required | Default in Dev | Production Value / Format | Security & Validation Rules |
|---|---|---|---|---|
| `NODE_ENV` | **YES** | `development` | `production` | Enforces production security checks, disables stack trace leakage, activates JWT entropy verification. |
| `PORT` | **YES** | `5000` | Assigned by Render (e.g., `10000`) | Server binds to `0.0.0.0:$PORT`. |
| `DATABASE_URL` | **YES** | Local PG URL | `postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require` | Must have SSL enabled (`sslmode=require`). Validated by `validateProductionEnv()`. |
| `JWT_SECRET` | **YES** | None | 64-character hex/base64 string | **Fail-Fast Enforced:** Must be $\ge$ 32 characters. Known placeholders (`change-this-before-production`, `secret`, `jwtsecret`) cause immediate process termination. Never printed in logs. |
| `APP_URL` | **YES** | `http://localhost:5173` | `https://gurudiamonds.in` | Used for CORS origin validation, sitemap canonical generation, and email hyperlinks. |
| `ADMIN_EMAIL` | **YES** | `admin@gurudiamonds.in` | Primary admin email | Authorized recipient for order alerts and system notifications. |
| `RAZORPAY_KEY_ID` | **YES** | Test key | `rzp_live_XXXXXXXXXXXXXXXXXX` | Must start with `rzp_live_` in production. Live checkout fails if a test key is supplied. |
| `RAZORPAY_KEY_SECRET` | **YES** | Test secret | Live Key Secret string | Generated from Razorpay Dashboard. Never exposed to client. |
| `RAZORPAY_WEBHOOK_SECRET` | **YES** | Test secret | Random 32+ character string | Used for HMAC SHA-256 signature verification in `backend/src/routes/payments.ts`. |
| `EMAIL_PROVIDER` | **YES** | `brevo` | `brevo` | Supported providers: `brevo`, `resend`, `smtp`. Recommended: `brevo`. |
| `BREVO_API_KEY` | **YES** | None | `xkeysib-XXXXXXXXXXXXXXXXXXXX` | Valid API key from Brevo account. |
| `FROM_EMAIL` | **YES** | `info@gurudiamonds.in` | `info@gurudiamonds.in` | Must be an authenticated domain sender in Brevo with valid SPF/DKIM records. |
| `FROM_NAME` | **YES** | `Guru Diamonds` | `Guru Diamonds` | Display name for transactional emails. |

---

## 2. Frontend Environment Variables (Vercel Dashboard)

The frontend SPA is built using Vite and deployed to Vercel. Vite injects `VITE_*` variables into the client bundle at build time.

| Variable Name | Required | Example Production Value | Description |
|---|---|---|---|
| `VITE_API_URL` | **YES** | `https://guru-dimonds.onrender.com/api` | Direct backend API URL for customer & admin requests. |
| `VITE_RAZORPAY_KEY_ID` | **YES** | `rzp_live_XXXXXXXXXXXXXXXXXX` | Public Razorpay live key ID passed to Razorpay Checkout JS modal. |

> [!CAUTION]
> Never set `RAZORPAY_KEY_SECRET` or `JWT_SECRET` in Vercel environment variables. Only the public `VITE_RAZORPAY_KEY_ID` may be exposed to the client browser.

---

## 3. Cryptographic Secret Generation Guide

To generate cryptographically secure production keys for `JWT_SECRET` and `RAZORPAY_WEBHOOK_SECRET`, execute the following command in PowerShell / Node CLI:

```bash
# Generate 64-byte random hex string (128 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Sample generated format:
`9f4a8b7c2d1e0f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c`

---

## 4. Pre-Flight Configuration Sign-Off

Before running database migrations or initiating user traffic:

```
+-------------------------------------------------------------------------------+
| CONFIGURATION VERIFICATION SIGN-OFF                                           |
+-------------------------------------------------------------------------------+
| [ ] Render: NODE_ENV set to "production"                                      |
| [ ] Render: DATABASE_URL connects to live PostgreSQL instance with SSL        |
| [ ] Render: JWT_SECRET generated with 64+ random characters                   |
| [ ] Render: RAZORPAY_KEY_ID starts with "rzp_live_"                           |
| [ ] Render: RAZORPAY_KEY_SECRET matching live key configured                  |
| [ ] Render: RAZORPAY_WEBHOOK_SECRET synchronized with Razorpay Dashboard      |
| [ ] Render: BREVO_API_KEY tested and verified                                 |
| [ ] Render: FROM_EMAIL verified in Brevo domain management                    |
| [ ] Vercel: VITE_API_URL points to backend production domain                 |
| [ ] Vercel: VITE_RAZORPAY_KEY_ID matches backend live key ID                  |
+-------------------------------------------------------------------------------+
```
