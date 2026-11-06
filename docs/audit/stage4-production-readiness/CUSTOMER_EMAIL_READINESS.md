# GURU DIAMONDS — CUSTOMER EMAIL & NOTIFICATION READINESS AUDIT

**Repository:** `https://github.com/yogeshks3998-sudo/guru-dimonds`  
**Mailer Engine:** `backend/src/utils/mailer.ts`  
**Email Service Providers Supported:** Brevo (Primary), Resend (Secondary), SMTP (Fallback)  
**Audit Stage:** Final Pre-Deployment Release Gate  

---

## 1. Notification Flows Audit & Classification Matrix

The application's transactional notification architecture was inspected across all controllers (`checkout.ts`, `payments.ts`, `orders.ts`, `auth.ts`, `mailer.ts`).

| Notification Event | Triggering Route / Source | Implementation Function | Status | Audit Findings & Notes |
|---|---|---|---|---|
| **1. Customer Registration OTP** | `POST /api/auth/send-otp` | `sendOtpEmail()` | **WORKING** | Six-digit OTP sent with 10-minute expiry window. Works for login/registration. |
| **2. Order Confirmation** | `POST /api/checkout/create-order` & Webhook | `sendOrderConfirmationEmail()` | **WORKING** | Sends luxury HTML invoice template with item details, pricing breakdown, shipping address, and tracking link. |
| **3. Payment Confirmation** | `POST /api/payments/webhook` | `sendOrderConfirmationEmail()` | **WORKING** | Merged into the order confirmation flow upon successful payment capture; records payment ID and transaction receipt. |
| **4. Order Confirmed / Processing** | `PATCH /api/orders/:id/status` | `sendOrderStatusEmail()` | **WORKING** | Triggered when Admin moves order status to `PROCESSING` or `CONFIRMED`. |
| **5. Dispatched / Shipped** | `PATCH /api/orders/:id/status` | `sendOrderStatusEmail()` | **WORKING** | Triggered when Admin moves status to `SHIPPED`. Includes courier carrier name, tracking number, and tracking URL. |
| **6. Out for Delivery** | `PATCH /api/orders/:id/status` | `sendOrderStatusEmail()` | **PARTIAL** | Status transition `OUT_FOR_DELIVERY` is supported by the status enum and email template, but lacks automated carrier webhook integration. Admin must trigger manually. |
| **7. Delivered** | `PATCH /api/orders/:id/status` | `sendOrderStatusEmail()` | **WORKING** | Sends final delivery completion and customer feedback request email upon `DELIVERED` status update. |
| **8. Refund Processed** | None (Admin Dashboard Only) | None | **NOT IMPLEMENTED** | No automated email template exists for refunds. When refunds are issued via Razorpay, Razorpay sends its own automated email receipt to the customer; application-level email is currently manual. |

---

## 2. Mailer Architecture & Implementation Details

The email client in `backend/src/utils/mailer.ts` contains built-in resilience:

1. **Brevo REST API Engine:**
   - Sends requests to `https://api.brevo.com/v3/smtp/email`.
   - Headers: `api-key: env.brevoApiKey`, `content-type: application/json`.
   - Payload: Structured sender, recipient, subject, and luxury HTML body.
2. **Safe Error Handling:**
   - Handles network timeouts, non-200 HTTP statuses, and non-JSON Brevo error responses safely without crashing the main Express request loop.
3. **Database Audit Logging:**
   - Every email attempt is asynchronously recorded to the `EmailLog` table with recipient, status (`SENT` or `FAILED`), provider, message ID, and timestamp.
4. **Development Fallback:**
   - If `BREVO_API_KEY` is not configured, the mailer logs the message content and OTP codes to the server console in development mode, preventing local development interruption.

---

## 3. Operational Requirements for Production Email Delivery

To ensure 100% email deliverability in production:

1. **Brevo Account Setup:**
   - Obtain a production API key from Brevo (`xkeysib-...`) and set as `BREVO_API_KEY` in Render.
2. **Domain Authentication (Crucial for Anti-Spam):**
   - In Brevo Dashboard $\rightarrow$ **Senders & IP** $\rightarrow$ **Domains**:
   - Add `gurudiamonds.in`.
   - Configure DNS records on the domain registrar (GoDaddy/Cloudflare):
     - **TXT (Brevo Code):** For domain ownership.
     - **TXT (DKIM):** `mail._domainkey.gurudiamonds.in` to prevent email spoofing.
     - **TXT (DMARC):** `v=DMARC1; p=none;` for email policy reporting.
3. **Sender Verification:**
   - Register `info@gurudiamonds.in` as an authenticated sender in Brevo.
   - Configure `FROM_EMAIL=info@gurudiamonds.in` and `FROM_NAME="Guru Diamonds"` in Render.

---

## 4. Post-Release Notification Roadmap

- **Phase 1 (Immediate / Post-Deploy):** Rely on Razorpay's native automated refund emails for customer payment refunds.
- **Phase 2 (Sprint 5):** Implement dedicated `sendRefundEmail()` template in `backend/src/utils/mailer.ts` triggered when Razorpay `refund.processed` webhook arrives.
