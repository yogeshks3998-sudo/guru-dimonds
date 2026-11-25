# 05. CUSTOMER END-TO-END TEST REPORT

**Target:** `docs/audit/stage4-production-readiness/05_CUSTOMER_E2E_TEST_REPORT.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** E-commerce QA Lead & Principal Software Architect  
**Test Harness:** Live Full-Stack Test Runner (`scratch/test-stage4-e2e.ts`) + Jest Commercial Suites  
**Target URL:** `http://localhost:5173` (Frontend) & `http://localhost:5055/api` (Backend)  

---

## 1. Executive Summary

A comprehensive 23-step customer journey audit was executed against the running application connected to the Neon PostgreSQL test database.

**Overall Customer Journey Status:** **PASS (100% of Core Workflows Passing)**

---

## 2. Customer Journey Execution Matrix

| # | Customer Journey Step | Endpoint / Component | Observed Behavior & Evidence | Status |
|---|---|---|---|:---:|
| 1 | **Homepage Load** | `GET /` (`http://localhost:5173`) | Serves SPA entrypoint, loads hero banner and bestselling products without uncaught runtime errors. | **PASS** |
| 2 | **Header Navigation** | Navigation bar links | Desktop & mobile drawer navigation routes cleanly between `/`, `/shop`, `/about`, `/contact`, `/track-order`. | **PASS** |
| 3 | **Category Browsing** | `GET /api/categories` | Returns 17 distinct jewellery categories (Rings, Necklaces, Pendants, Bangles, etc.) with accurate product counts. | **PASS** |
| 4 | **Product Search** | `GET /api/products?search=ring` | Full-text query matched 19 relevant products matching "ring" across name, SKU, and description. | **PASS** |
| 5 | **Filters & Sorting** | `ShopPage.tsx` | Price filters, metal type filters (Gold 24k/22k/18k, Silver 925), and price sorting operate client-side without layout shifts. | **PASS** |
| 6 | **Product Detail Load** | `GET /api/products/:slug` | Retreived "Crown Imperial Halo Diamond Silver Ring" with accurate specifications, certifications, and high-res imagery. | **PASS** |
| 7 | **Variant Selection** | Product detail selector | Selecting size/metal switches active variant, recalculates weight, and updates dynamic SKU. | **PASS** |
| 8 | **Metal Rate Pricing** | `GET /api/metal-rates` | Live pricing engine incorporates published bullion rates (Gold 24k, Silver 925), making charges, and GST. | **PASS** |
| 9 | **Add to Cart** | `POST /api/cart/items` | Item successfully added with quantity 1. Cart state persists across route changes. | **PASS** |
| 10 | **Cart Quantity Update** | `PATCH /api/cart/items/:id` | Increments and decrements adjust cart subtotal and tax dynamically. | **PASS** |
| 11 | **Coupon Validation** | `POST /api/coupons/validate` | Code `WELCOME10` validated successfully against minimum order amount with descriptive confirmation message. | **PASS** |
| 12 | **Checkout Form Validation** | `CheckoutPage.tsx` | Strict validation enforces 10-digit phone, 6-digit PIN code, state, city, and recipient name. | **PASS** |
| 13 | **Razorpay Test Order** | `POST /api/payments/razorpay/create-order` | Server generates authentic Razorpay order ID (`order_...`) using paise-denominated server-calculated totals. | **PASS** |
| 14 | **Order Creation** | `Order` entity | Order created in `CONFIRMED` status with full item, payment, and history snapshots. | **PASS** |
| 15 | **Payment Verification** | `POST /api/payments/razorpay/verify` | Timing-safe HMAC SHA256 validation verifies payment signature before transitioning status to `PAID`. | **PASS** |
| 16 | **Inventory Deduction** | Stock deduction service | Inventory decremented transactionally upon payment confirmation. | **PASS** |
| 17 | **Order Confirmation** | Confirmation screen | Displays unique order number (`ORD-E2E-...`), delivery estimate, and order summary. | **PASS** |
| 18 | **Customer Order History** | `GET /api/orders/my-orders` | Authenticated customer fetches their orders with status milestones and tracking links. | **PASS** |
| 19 | **Secure Order Tracking** | `GET /api/orders/track/:reference` | Public lookup by order number or courier ID displays fulfillment milestones with zero customer PII exposed. | **PASS** |
| 20 | **Contact Inquiries** | `POST /api/inquiries` | Contact message validated and persisted directly to PostgreSQL `Inquiry` table. | **PASS** |
| 21 | **Wishlist Operations** | `POST /api/wishlist/items` | Adding and removing items syncs with customer profile in database. | **PASS** |
| 22 | **Mobile Checkout UX** | Responsive viewport | Tested mobile layout (375px–414px) with sticky action button and touch-friendly controls. | **PASS** |
| 23 | **Page Refresh Persistence** | LocalStorage + React Store | Refreshing page retains cart items, authenticated customer token, and currency preferences. | **PASS** |

---

## 3. Negative and Recovery Edge Cases Tested

1. **Payment Failure Simulation:** Simulated failed Razorpay payment event. Order remains in unpaid state without deducting inventory.
2. **Invalid Coupon Code:** Submitting `INVALID99` returns HTTP 404 with "Invalid or expired coupon code."
3. **Below Minimum Order Coupon:** Submitting coupon with order amount below threshold returns HTTP 400 with helpful minimum spend notice.
4. **Expired Customer Token:** Supplying invalid JWT to `/orders/my-orders` returns HTTP 401 Unauthorized with clean redirect prompt.
5. **Rate-Limit Flooding:** Submitting 6 inquiries within 1 minute from the same IP triggered HTTP 429 Too Many Requests.
