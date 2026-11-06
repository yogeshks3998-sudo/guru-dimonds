# GURU DIAMONDS — RAZORPAY LIVE CONFIGURATION RUNBOOK

**Repository:** `https://github.com/yogeshks3998-sudo/guru-dimonds`  
**Audit Stage:** Final Pre-Deployment Release Gate  
**Compliance Standard:** PCI-DSS SAQ-A / Razorpay Standard Checkout  
**Security Level:** Production Payment Operations  

---

## 1. Live Mode Readiness & Architecture

The Guru Diamonds payment workflow utilizes Razorpay Standard Checkout with server-side order initiation and asynchronous webhook confirmation:

```
[Customer Browser] ──(1. Checkout Request)──► [Guru Diamonds API]
                                                      │ (2. Create Razorpay Order)
                                                      ▼
[Customer Browser] ◄──(3. Return Order ID)──── [Razorpay API]
       │
       ▼ (4. Render Razorpay Modal & Complete Payment)
[Razorpay Gateway] ──(5. Webhook POST: payment.captured)──► [Guru Diamonds API]
                                                                    │ (6. HMAC Signature Check)
                                                                    ▼
                                                            [Database: Update Order to PAID]
                                                            [Mailer: Send Confirmation Email]
```

### Key Security Implementations (Stage 1 Remediated):
- **Mandatory Webhook Secret:** `backend/src/routes/payments.ts` rejects webhook processing if `RAZORPAY_WEBHOOK_SECRET` is unset.
- **HMAC SHA-256 Verification:** Signatures are validated against the raw body buffer using `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`.
- **Constant-Time Comparison:** Prevents timing-attack vulnerabilities.
- **Malformed Signature Safety:** Protects against unhandled exceptions from invalid signature lengths.

---

## 2. Step-by-Step Live Dashboard Configuration

### Step 2.1: Activate Live Mode
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle the environment switch at the top navigation bar from **Test Mode** to **Live Mode**.
3. Ensure KYC verification and Merchant Bank Account status display **Active**.

### Step 2.2: Generate Live API Keys
1. Navigate to: **Settings** $\rightarrow$ **API Keys**.
2. Click **Generate Live Key**.
3. Note the two values immediately:
   - **Key ID:** Starts with `rzp_live_...` (e.g., `rzp_live_abc123def456`)
   - **Key Secret:** 24–32 character alphanumeric string.
4. **Distribute credentials securely:**
   - Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Render Environment Variables.
   - Add `VITE_RAZORPAY_KEY_ID` to Vercel Environment Variables.

> [!WARNING]
> Never put `RAZORPAY_KEY_SECRET` into Vercel or any client-side configuration.

### Step 2.3: Configure Production Webhook
1. In the Razorpay Dashboard (Live Mode), navigate to: **Settings** $\rightarrow$ **Webhooks**.
2. Click **+ Add New Webhook**.
3. Enter the following parameters:
   - **Webhook URL:** `https://guru-dimonds.onrender.com/api/payments/webhook`
   - **Secret:** Generate a 32+ character random alphanumeric secret (e.g., via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - **Alert Email:** `admin@gurudiamonds.in` (receives alerts if webhook endpoints fail).
4. Select the following **Active Events**:
   - `payment.captured` *(Critical: Transitions order to PROCESSING/PAID)*
   - `payment.failed` *(Critical: Marks order as PAYMENT_FAILED)*
   - `order.paid` *(Redundant confirmation)*
   - `refund.processed` *(Updates refund status)*
5. Click **Save Webhook**.
6. Set `RAZORPAY_WEBHOOK_SECRET` in Render Environment Variables to the exact secret entered above.

---

## 3. Production 1-Rupee Live Verification Protocol

To verify live payment processing without substantial capital commitment:

1. **Create Verification Product:**
   - In the Admin Panel (`/admin/products`), create a hidden or test product named `Production Live Verification Test` priced at **₹1.00**.
   - Alternatively, apply a test coupon that discounts a cart to **₹1.00**.
2. **Execute Live Payment:**
   - From an external network (mobile device or incognito window), navigate to the storefront.
   - Add the ₹1.00 item to cart and proceed to checkout.
   - Enter genuine customer name, shipping address, and phone number.
   - Select **Pay Online (Razorpay)**.
   - In the Razorpay checkout modal, complete payment via UPI (e.g., GPay / PhonePe).
3. **Verify System Response:**
   - Confirm immediate redirect to `/order-success/:id`.
   - In Render logs, verify: `Webhook verified successfully for event: payment.captured`.
   - In Admin Panel (`/admin/orders`), verify the order status has transitioned from `PENDING` to `PROCESSING` with `Payment Status: PAID`.
   - Check customer inbox for order confirmation email.
4. **Execute Verification Refund:**
   - Log in to Razorpay Dashboard $\rightarrow$ **Transactions** $\rightarrow$ **Payments**.
   - Select the ₹1.00 payment and click **Issue Full Refund**.
   - Confirm refund completion in Razorpay and customer UPI account.

---

## 4. Troubleshooting & Fallback Procedures

| Symptom | Probable Cause | Corrective Action |
|---|---|---|
| Checkout modal opens with "Key ID not recognized" | `VITE_RAZORPAY_KEY_ID` missing or has test prefix | Verify Vercel environment variables and trigger redeploy. |
| Customer paid but order remains in `PENDING` | Webhook URL mismatch or webhook secret mismatch | Check Render logs for `400 Invalid signature`. Verify `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard. |
| Webhook endpoint returning 500 | Database connection failure during order update | Check Render PostgreSQL connection pool and SSL settings. |
| Double fulfillment / multiple webhook deliveries | Razorpay retry policy on delayed response | The backend idempotent webhook handler prevents duplicate state transitions for already paid orders. |
