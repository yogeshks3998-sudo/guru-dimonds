# 07. RAZORPAY PRODUCTION READINESS AUDIT

**Target:** `docs/audit/stage4-production-readiness/07_RAZORPAY_PRODUCTION_READINESS.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** Security Engineer & Payment Systems Architect  
**Gateway:** Razorpay (India) API v1  
**Current Mode:** Test Mode (`rzp_test_...`)  

---

## 1. Executive Summary

The Razorpay payment integration in Guru Diamonds was subjected to an exhaustive technical and security review covering payment creation, cryptographic signature verification, server-side amount calculation, webhook processing, idempotency, and live mode migration readiness.

**Overall Readiness Status:** **READY WITH CONDITIONS (Requires Live Dashboard Configuration)**

---

## 2. Technical Payment Architecture Review

```
[Customer Browser] ── 1. Create Order ──> [Backend Express API] ── 2. Create Order ──> [Razorpay API]
       │                                           │                                        │
       │                                           ▼ (Stores Order in 'CREATED' status)     ▼ (Returns 'order_...')
       │ <─────────── 3. Return 'order_id' ────────┘                                        │
       │                                                                                    │
       ▼ (Opens Razorpay Checkout Modal)                                                    │
[Customer Pays] ────────────────────────────────────────────────────────────────────────────┘
       │
       ├── A. Client Verification ──> POST /api/payments/razorpay/verify (HMAC SHA256)
       │
       └── B. Webhook Dispatch  ────> POST /api/payments/webhook/razorpay (HMAC SHA256)
                                          │
                                          ▼
                             [Order Marked PAID in DB]
                             [Inventory Decremented]
                             [Invoice & Email Dispatched]
```

---

## 3. Security & Integrity Controls Assessment

| Control Area | Implementation in Code | Verification Status |
| :--- | :--- | :---: |
| **Server-Side Amount Calculation** | `calculateCheckout(prisma, trustedInput)` calculates subtotal, GST, making charges, and discounts on server. Client payload amounts are discarded. | **VERIFIED** |
| **Paise Unit Conversion** | `toPaise(totals.totalAmount)` properly multiplies by 100 with rounding (`Math.round`) to prevent floating-point inaccuracies. | **VERIFIED** |
| **Payment Signature Verification** | `crypto.timingSafeEqual` compares HMAC SHA256 of `${razorpayOrderId}\|${razorpayPaymentId}` with `x-razorpay-signature`. | **VERIFIED** |
| **Webhook HMAC Verification** | Webhook request raw body is hashed against `RAZORPAY_WEBHOOK_SECRET`. Missing or forged signatures are rejected with HTTP 400. | **VERIFIED** |
| **Payment Idempotency** | `if (order.paymentStatus === 'PAID') return order;` prevents duplicate stock deduction or repeated confirmations. | **VERIFIED** |
| **Cross-Order Replay Protection** | `tx.payment.findFirst({ where: { providerPaymentId, NOT: { orderId } } })` rejects payment IDs used on other orders (HTTP 409). | **VERIFIED** |
| **Inventory Deduction Safety** | Inventory is decremented only inside a PostgreSQL interactive transaction with row-level locks upon payment capture. | **VERIFIED** |
| **Payment Log Privacy** | Sensitive card details (PAN, CVV) are handled exclusively within Razorpay's PCI-DSS compliant iframe and never touch Guru Diamonds servers. | **VERIFIED** |

---

## 4. Manual Production Activation Runbook

To safely transition from Razorpay Test Mode to Live Mode in production:

### Step 1: Obtain Production Credentials
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch toggle in header from **Test Mode** to **Live Mode**.
3. Navigate to **Settings** -> **API Keys**.
4. Generate Live Keys:
   - Record `Key Id` (starts with `rzp_live_...`).
   - Record `Key Secret` (high-entropy string).

### Step 2: Configure Webhook in Razorpay Dashboard
1. Navigate to **Settings** -> **Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL:** `https://guru-dimonds.onrender.com/api/payments/webhook/razorpay`
4. **Secret:** Generate a dedicated random 32-character secret string.
5. **Active Events to Select:**
   - [x] `payment.captured`
   - [x] `payment.failed`
   - [x] `refund.processed` (if refunds enabled)
6. Save Webhook and copy the secret.

### Step 3: Update Render Production Environment Variables
Set the following secrets in the Render Web Service dashboard:
- `RAZORPAY_KEY_ID`: `rzp_live_...`
- `RAZORPAY_KEY_SECRET`: Live Key Secret
- `RAZORPAY_WEBHOOK_SECRET`: Webhook Secret created in Step 2

### Step 4: Verification Without Live Charge Risk
1. Perform initial checkout initialization. Verify the modal displays the live Razorpay branding and merchant name ("Guru Diamonds").
2. Verify that cancel/close operations do not throw uncaught JavaScript exceptions.
