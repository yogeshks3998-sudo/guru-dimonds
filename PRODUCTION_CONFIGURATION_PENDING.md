# GURU DIAMONDS — PRODUCTION CONFIGURATION PENDING RUNBOOK

**Repository:** `https://github.com/yogeshks3998-sudo/guru-dimonds`  
**Target Environments:** Render (API Backend) & Vercel (Storefront SPA)  
**Payment Gateway:** Razorpay Live  
**Email Provider:** Brevo Transactional Email  
**Audit Stage:** Final GitHub PR Preparation  
**Status:** **AWAITING EXTERNAL SERVICE CREDENTIAL PROVISIONING BY ADMINISTRATOR**

---

## 1. Code-Level Readiness vs. Operational Prerequisites

All application code, schema migrations, security middleware, and integration endpoints are **100% implemented, tested, and ready**. 

Live production activation requires the administrator to configure the following external cloud settings in Render, Vercel, Razorpay, and Brevo dashboards.

```
+---------------------------------------------------------------------------------------+
| PRE-ACTIVATION EXTERNAL CHECKLIST (Administrator Action Required)                     |
+---------------------------------------------------------------------------------------+
| [ ] 1. Render Dashboard: Set production environment variables (JWT, DB, Razorpay, Brevo)|
| [ ] 2. Vercel Dashboard: Set client-facing environment variables (VITE_API_URL, Key ID)|
| [ ] 3. Razorpay Dashboard: Switch to Live Mode and configure exact Webhook URL         |
| [ ] 4. Brevo Dashboard: Authenticate sender domain (SPF/DKIM/DMARC) for gurudiamonds.in |
| [ ] 5. Render Service: Trigger deployment with `npx prisma migrate deploy`             |
+---------------------------------------------------------------------------------------+
```

---

## 2. Render Backend Configuration (API Service)

Navigate to **Render Dashboard** $\rightarrow$ **Guru Diamonds API** $\rightarrow$ **Environment**.

### 2.1 Required Variables Matrix

| Variable Name | Required | Example Production Format | Description / Security Enforcement |
|---|---|---|---|
| `NODE_ENV` | **YES** | `production` | Activates production security guards and suppresses stack traces. |
| `PORT` | **YES** | `10000` (or Render default) | Server socket listener port. |
| `DATABASE_URL` | **YES** | `postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require` | PostgreSQL connection string. Must include SSL (`sslmode=require`). |
| `JWT_SECRET` | **YES** | `<64-character random hex string>` | **Fail-Fast Enforced:** Minimum 32 characters. Known placeholders cause immediate server startup failure. |
| `APP_URL` | **YES** | `https://gurudiamonds.in` | Storefront origin for CORS policy, canonical sitemaps, and emails. |
| `ADMIN_EMAIL` | **YES** | `admin@gurudiamonds.in` | Primary administrative contact for system alerts. |
| `RAZORPAY_KEY_ID` | **YES** | `rzp_live_XXXXXXXXXXXXXXXXXX` | Must begin with `rzp_live_` in production. |
| `RAZORPAY_KEY_SECRET` | **YES** | `<Live Key Secret string>` | Generated from Razorpay Dashboard. Never expose to client. |
| `RAZORPAY_WEBHOOK_SECRET` | **YES** | `<32+ character random string>` | Cryptographic secret for verifying webhook HMAC SHA-256 signatures. |
| `EMAIL_PROVIDER` | **YES** | `brevo` | Active transactional email provider. |
| `BREVO_API_KEY` | **YES** | `xkeysib-XXXXXXXXXXXXXXXXXXXX` | Production API key generated from Brevo account. |
| `FROM_EMAIL` | **YES** | `info@gurudiamonds.in` | Must be an authenticated domain sender in Brevo. |
| `FROM_NAME` | **YES** | `Guru Diamonds` | Display name for transactional customer emails. |

### 2.2 Secure Key Generation Command
Generate production values for `JWT_SECRET` and `RAZORPAY_WEBHOOK_SECRET`:
```bash
# Generate 64 random bytes (128 hex characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3. Vercel Frontend Configuration (Storefront SPA)

Navigate to **Vercel Dashboard** $\rightarrow$ **Guru Diamonds Storefront** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.

| Variable Name | Environment | Value | Description |
|---|---|---|---|
| `VITE_API_URL` | Production | `https://guru-dimonds.onrender.com/api` | Backend API root for storefront and admin panel. |
| `VITE_RAZORPAY_KEY_ID` | Production | `rzp_live_XXXXXXXXXXXXXXXXXX` | Public Razorpay live key passed to Razorpay Checkout JS modal. |

> [!CAUTION]
> Do NOT set `RAZORPAY_KEY_SECRET` or `JWT_SECRET` in Vercel. Only public client variables prefixed with `VITE_` should be configured in Vercel.

---

## 4. Razorpay Dashboard Live Mode Setup

Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/):

### Step 4.1: Switch to Live Mode
1. In the top navigation header, toggle the switch from **Test Mode** to **Live Mode**.
2. Verify KYC approval and bank account status are **Active**.

### Step 4.2: Generate Live API Keys
1. Go to: **Settings** $\rightarrow$ **API Keys**.
2. Click **Generate Live Key**.
3. Copy the **Key ID** (`rzp_live_...`) to both Render (`RAZORPAY_KEY_ID`) and Vercel (`VITE_RAZORPAY_KEY_ID`).
4. Copy the **Key Secret** to Render (`RAZORPAY_KEY_SECRET`).

### Step 4.3: Configure Production Webhook
1. Go to: **Settings** $\rightarrow$ **Webhooks**.
2. Click **+ Add New Webhook**.
3. Fill in the exact details:
   - **Webhook URL:**
     ```text
     https://guru-dimonds.onrender.com/api/payments/webhook/razorpay
     ```
     *(CRITICAL: Ensure the `/razorpay` suffix is present; otherwise requests will 404).*
   - **Secret:** Enter the exact string configured in Render as `RAZORPAY_WEBHOOK_SECRET`.
   - **Alert Email:** `admin@gurudiamonds.in`
4. Select the following **Active Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
5. Click **Save Webhook**.

---

## 5. Brevo Email & Domain Authentication Setup

To prevent customer OTP and order confirmation emails from landing in spam:

1. **Create / Log in to Brevo Account:**
   - Go to [Brevo](https://www.brevo.com/) $\rightarrow$ **SMTP & API** $\rightarrow$ Generate API key $\rightarrow$ set as `BREVO_API_KEY` in Render.
2. **Domain Authentication (DKIM / SPF):**
   - Go to **Senders & IP** $\rightarrow$ **Domains** $\rightarrow$ Click **Add Domain** (`gurudiamonds.in`).
   - Copy the generated DNS records to your DNS provider (Cloudflare / GoDaddy / Namecheap):
     - **TXT Record:** Brevo verification code.
     - **TXT Record (DKIM):** `mail._domainkey.gurudiamonds.in` value.
     - **TXT Record (DMARC):** `v=DMARC1; p=none;`
3. **Sender Verification:**
   - Go to **Senders** $\rightarrow$ Add `info@gurudiamonds.in` $\rightarrow$ Confirm verification email.

---

## 6. Pre-Traffic 1-Rupee Live Verification Protocol

Once environment variables are set and the service is deployed:
1. Create a ₹1.00 test product or apply a discount coupon resulting in a ₹1.00 cart total.
2. Complete payment via UPI in an external browser.
3. Confirm immediate transition to `/order-success` and verify order status moves to `PROCESSING` with `PAID` in admin panel.
4. Issue a full refund from Razorpay Dashboard to confirm reverse accounting.
