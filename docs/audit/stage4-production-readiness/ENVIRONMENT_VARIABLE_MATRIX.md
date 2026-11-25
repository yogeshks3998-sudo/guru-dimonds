# ENVIRONMENT VARIABLE MATRIX & CONFIGURATION GUIDE

**Target:** `docs/audit/stage4-production-readiness/ENVIRONMENT_VARIABLE_MATRIX.md`  

---

## 1. Environment Variable Inventory & Definitions

*Per strict security rules, actual secrets and credentials are omitted.*

| Variable Name | Hosting Scope | Default Fallback (Local) | Production Requirement | Expected Format |
| :--- | :--- | :--- | :---: | :--- |
| `NODE_ENV` | Render | `development` | Mandatory | `production` |
| `PORT` | Render / Local | `5000` | Mandatory | `10000` (Render) or `5000` (Docker) |
| `DATABASE_URL` | Render / Local | Local Postgres connection | Mandatory | `postgresql://user:pass@ep-....neon.tech/gurudiamonds?sslmode=require` |
| `JWT_SECRET` | Render / Local | Development secret | Mandatory | Random 32+ character high-entropy alphanumeric string |
| `APP_URL` | Render / Local | `https://gurudiamonds.in` | Mandatory | `https://gurudiamonds.in` |
| `VITE_API_URL` | Vercel / Local | `http://localhost:5000/api` | Mandatory | `https://guru-dimonds.onrender.com/api` |
| `RAZORPAY_KEY_ID` | Render / Local | `rzp_test_...` | Mandatory | `rzp_live_...` (Live) or `rzp_test_...` (Staging) |
| `RAZORPAY_KEY_SECRET` | Render / Local | Test Key Secret | Mandatory | High-entropy secret from Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Render / Local | Test Webhook Secret | Mandatory | High-entropy secret matching Razorpay Webhook settings |
| `EMAIL_PROVIDER` | Render / Local | `brevo` | Mandatory | `brevo`, `resend`, or `smtp` |
| `FROM_EMAIL` | Render / Local | `info@gurudiamonds.in` | Mandatory | Verified domain email address |
| `FROM_NAME` | Render / Local | `Guru Diamonds` | Mandatory | String display name |
| `BREVO_API_KEY` | Render / Local | None | Conditional | `xkeysib-...` (Required if `EMAIL_PROVIDER=brevo`) |
| `RESEND_API_KEY` | Render / Local | None | Conditional | `re_...` (Required if `EMAIL_PROVIDER=resend`) |

---

## 2. Platform Assignment Mapping

### Vercel (Frontend Environment Variables)
Configure under **Project Settings** -> **Environment Variables**:
- `VITE_API_URL` = `https://guru-dimonds.onrender.com/api`

### Render (Backend Environment Variables & Secrets)
Configure under **Web Service** -> **Environment**:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = `[Neon Production Connection String]`
- `JWT_SECRET` = `[Production JWT Signing Secret]`
- `APP_URL` = `https://gurudiamonds.in`
- `RAZORPAY_KEY_ID` = `rzp_live_...`
- `RAZORPAY_KEY_SECRET` = `[Live Razorpay Key Secret]`
- `RAZORPAY_WEBHOOK_SECRET` = `[Live Razorpay Webhook Signing Secret]`
- `EMAIL_PROVIDER` = `brevo`
- `FROM_EMAIL` = `info@gurudiamonds.in`
- `FROM_NAME` = `Guru Diamonds`
- `BREVO_API_KEY` = `[Production Brevo API Key]`
