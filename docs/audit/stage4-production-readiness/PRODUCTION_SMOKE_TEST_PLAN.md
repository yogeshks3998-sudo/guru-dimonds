# GURU DIAMONDS — PRODUCTION SMOKE TEST PLAN & RUNBOOK

**Target Production URLs:**
- **Storefront (Vercel):** `https://gurudiamonds.in` (or deployment preview URL)
- **API Backend (Render):** `https://guru-dimonds.onrender.com`
**Audit Stage:** Final Pre-Deployment Release Gate  
**Execution Window:** Immediate Post-Deployment (T+0 to T+30 minutes)  

---

## 1. Automated Verification Checklist

Execute this smoke test suite immediately upon deployment of backend and frontend services.

```
+----+----------------------------------------+---------------------------------------+--------+
| #  | Test Scenario                          | Target Endpoint / Action              | Result |
+----+----------------------------------------+---------------------------------------+--------+
| 01 | API Health & Database Heartbeat        | GET /api/health                       | [ ]    |
| 02 | robots.txt Availability                | GET /robots.txt                       | [ ]    |
| 03 | Canonical XML Sitemap Availability     | GET /sitemap.xml                      | [ ]    |
| 04 | Image XML Sitemap Availability         | GET /image-sitemap.xml                | [ ]    |
| 05 | Catalog Listing API                    | GET /api/catalog/products             | [ ]    |
| 06 | Product Detail Page & Dynamic Variants | GET /api/catalog/products/:slug       | [ ]    |
| 07 | Customer OTP Authentication            | POST /api/auth/send-otp               | [ ]    |
| 08 | Cart & Coupon Validation               | POST /api/checkout/validate-coupon    | [ ]    |
| 09 | Razorpay Order Creation                | POST /api/checkout/create-order       | [ ]    |
| 10 | Customer Order Tracking Dual-Factor    | GET /api/orders/track                 | [ ]    |
| 11 | Contact Inquiry Submission             | POST /api/inquiries                   | [ ]    |
| 12 | Admin Authentication & Dashboard       | POST /api/auth/admin-login            | [ ]    |
+----+----------------------------------------+---------------------------------------+--------+
```

---

## 2. Step-by-Step Test Execution & Curl Commands

### Test 1: API Health & Database Heartbeat
```bash
curl -i -X GET https://guru-dimonds.onrender.com/api/health
```
- **Expected Status:** `200 OK`
- **Expected Body:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-...",
    "database": "connected"
  }
  ```

---

### Test 2: SEO Sitemaps & Robots Verification
```bash
# Verify robots.txt
curl -i -X GET https://gurudiamonds.in/robots.txt
# Expected: User-agent: * Allow: / Sitemap: https://gurudiamonds.in/sitemap.xml

# Verify main sitemap
curl -i -X GET https://gurudiamonds.in/sitemap.xml | head -n 10
# Expected: <?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...
```

---

### Test 3: Public Catalog & Variant Selection
```bash
curl -i -X GET "https://guru-dimonds.onrender.com/api/catalog/products?limit=5"
```
- **Expected Status:** `200 OK`
- **Verification:** Products array contains valid items with non-empty `variants`, `price`, and `images`.

---

### Test 4: Customer Registration / Login OTP
```bash
curl -i -X POST https://guru-dimonds.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "smoke-test@gurudiamonds.in"}'
```
- **Expected Status:** `200 OK`
- **Verification:** Response returns `{ "success": true, "message": "OTP sent successfully" }`. Email received in inbox (or logged if in staging).

---

### Test 5: Coupon Validation
```bash
curl -i -X POST https://guru-dimonds.onrender.com/api/checkout/validate-coupon \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME10", "orderAmount": 50000}'
```
- **Expected Status:** `200 OK`
- **Verification:** Returns discount breakdown:
  ```json
  {
    "valid": true,
    "code": "WELCOME10",
    "discountAmount": 5000,
    "finalAmount": 45000
  }
  ```

---

### Test 6: Razorpay Order Creation
```bash
curl -i -X POST https://guru-dimonds.onrender.com/api/checkout/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"variantId": "smoke-test-variant", "quantity": 1, "price": 100}],
    "shippingAddress": {
      "fullName": "QA Tester",
      "addressLine1": "123 Test St",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560001",
      "phone": "9999999999"
    },
    "couponCode": ""
  }'
```
- **Expected Status:** `200 OK`
- **Verification:** Returns `{ "orderId": "order_...", "amount": 10000, "currency": "INR", "keyId": "rzp_live_..." }`.

---

### Test 7: Secure Dual-Factor Order Tracking
```bash
# 1. Test missing phone (Must be rejected)
curl -i -X GET "https://guru-dimonds.onrender.com/api/orders/track?orderNumber=ORD-12345"
# Expected Status: 400 Bad Request

# 2. Test valid orderNumber + phone
curl -i -X GET "https://guru-dimonds.onrender.com/api/orders/track?orderNumber=ORD-12345&phone=9999999999"
# Expected Status: 200 OK (or 404 if order does not exist, but NOT 400)
```

---

### Test 8: Contact Form Inquiry Submission
```bash
curl -i -X POST https://guru-dimonds.onrender.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Smoke Test",
    "email": "smoke-test@gurudiamonds.in",
    "phone": "9999999999",
    "subject": "General Inquiry",
    "message": "Testing automated inquiry persistence post-deployment."
  }'
```
- **Expected Status:** `201 Created`
- **Verification:** Record exists in PostgreSQL `Inquiry` table with `status = 'NEW'`.

---

### Test 9: Admin Authentication & Management
1. In browser, navigate to: `https://gurudiamonds.in/admin`
2. Enter admin credentials:
   - **Email:** `admin@gurudiamonds.in`
   - **Password:** Pre-configured secure admin password.
3. Verify access to:
   - Dashboard statistics.
   - Products list and variant editor.
   - Inquiries tab (confirm Test 8 inquiry appears).
   - Orders tab (status transition controls).

---

## 3. Incident Escalation & Rollback Thresholds

If any of the following occur during smoke testing, halt the release immediately:
1. `GET /api/health` returns 500 or fails to connect to database.
2. Checkout fails to return Razorpay `orderId`.
3. Customer OTP emails fail to send.
4. Admin panel inaccessible.

**Immediate Action:** Execute the rollback runbook in `docs/audit/stage4-production-readiness/ROLLBACK_PLAN.md`.
