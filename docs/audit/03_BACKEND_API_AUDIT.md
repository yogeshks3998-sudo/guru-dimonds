# 03 — BACKEND API AUDIT & SECURITY ANALYSIS
**Project:** Guru Diamonds  
**Audit Date:** November 6, 2026  
**Auditor Role:** Backend Architect & Cybersecurity Auditor  
**Status:** COMPLETE & EVIDENCE-BASED  

---

## 1. Complete API Inventory Matrix

The backend registers **53 REST API endpoints** across 14 Express routers. Every endpoint was tested against its handler, authentication requirement, RBAC role restrictions, database mutation pattern, and frontend consumer.

| Method | Endpoint | Handler File | Auth Required | Allowed Roles | Database Operation | Frontend Consumer | Status | Risk / Security Finding |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/customer/register` | `auth.ts` | None | Public | `PendingRegistration.upsert` | `CustomerLoginPage` | Verified | Rate-limiting missing on OTP dispatch |
| `POST` | `/api/auth/customer/verify-otp` | `auth.ts` | None | Public | `Customer.create`, `deleteMany` | `CustomerLoginPage` | Verified | Max 5 failed attempts enforced |
| `POST` | `/api/auth/customer/resend-otp` | `auth.ts` | None | Public | `PendingRegistration.update` | `CustomerLoginPage` | Verified | Resend cooldown window enforced |
| `POST` | `/api/auth/customer/login` | `auth.ts` | None | Public | `Customer.findUnique` | `CustomerLoginPage` | Verified | Bcrypt comparison (salt 12) |
| `POST` | `/api/auth/admin/login` | `auth.ts` | None | Public | `AdminUser.findUnique`, `update` | `AdminLoginPage` | Verified | Issues 8-hour JWT session |
| `GET` | `/api/auth/me` | `auth.ts` | `requireAuth` | Any Auth | `AdminUser` / `Customer.findUnique` | `useAuthStore.restoreSession` | Verified | Validates active session token |
| `POST` | `/api/auth/logout` | `auth.ts` | None | Public | None | `useAuthStore.logout` | Verified | Stateless client token purge |
| `GET` | `/api/cart` | `cart.ts` | `requireCustomer`| Customer | `Cart.upsert`, `findUnique` | `useCartStore` | Verified | Auto-creates cart if missing |
| `POST` | `/api/cart/items` | `cart.ts` | `requireCustomer`| Customer | `CartItem.create` / `update` | `useCartStore.addItem` | Verified | Verifies item is active in stock |
| `PATCH`| `/api/cart/items/:id` | `cart.ts` | `requireCustomer`| Customer | `CartItem.update` | `useCartStore.updateQuantity`| Verified | Checks customer ownership |
| `DELETE`| `/api/cart/items/:id` | `cart.ts`| `requireCustomer`| Customer | `CartItem.delete` | `useCartStore.removeItem` | Verified | Checks customer ownership |
| `DELETE`| `/api/cart` | `cart.ts` | `requireCustomer`| Customer | `CartItem.deleteMany` | `useCartStore.clearCart` | Verified | Purges customer cart |
| `GET` | `/api/categories` | `catalog.ts` | None | Public | `Category.findMany` | `useCategoryStore` | Verified | Ordered alphabetically |
| `PUT` | `/api/categories/:id` | `catalog.ts` | `requireRole` | `OWNER`, `PRODUCT_MANAGER` | `Category.upsert` | `AdminCategoriesPage` | Verified | Subcategories stored as JSON |
| `DELETE`| `/api/categories/:id`| `catalog.ts` | `requireRole` | `OWNER`, `PRODUCT_MANAGER` | `Category.delete` | `AdminCategoriesPage` | Verified | Safe delete with error catch |
| `GET` | `/api/collections` | `catalog.ts` | None | Public | `JewelleryCollection.findMany` | `ShopPage` | Verified | Banner imagery included |
| `PUT` | `/api/collections/:id` | `catalog.ts`| `requireRole` | `OWNER`, `PRODUCT_MGR`, `CONTENT_MGR` | `JewelleryCollection.upsert`| `AdminCMSPage` | Verified | Banner assignments |
| `GET` | `/api/products` | `catalog.ts` | None | Public | `Product.findMany` | `useProductStore` | Verified | Inefficient when base64 images exist |
| `GET` | `/api/products/:slug` | `catalog.ts` | None | Public | `Product.findUnique` | `ProductDetailPage` | Verified | Full variant tree included |
| `POST` | `/api/products` | `catalog.ts` | `requireRole` | `OWNER`, `PRODUCT_MANAGER` | `Product.create`, `variants`, `media` | `AdminProductFormPage` | Verified | Multi-megabyte JSON payload risk |
| `PUT` | `/api/products/:id` | `catalog.ts` | `requireRole` | `OWNER`, `PRODUCT_MANAGER` | `Product.update`, `variants.deleteMany` | `AdminProductFormPage` | **Fragile** | **Foreign key error** if `OrderItem` exists |
| `DELETE`| `/api/products/:id` | `catalog.ts` | `requireRole` | `OWNER`, `PRODUCT_MANAGER` | `Product.delete` | `AdminProductsPage` | Verified | Cascades to variants |
| `POST` | `/api/checkout/validate` | `checkout.ts`| `requireCustomer`| Customer | `Cart.findUnique`, `Product.findMany` | `CheckoutPage` | Verified | Server-side price recalculation |
| `POST` | `/api/checkout/create-order`| `checkout.ts`| `requireCustomer`| Customer | `Order.create`, `decrementInventory` | `CheckoutPage` (COD) | Verified | Atomic `prisma.$transaction` |
| `GET` | `/api/cms` | `content.ts` | None | Public | `cMSContent.findUnique` | `useCMSStore` | Verified | Hero slides, announcement bar |
| `PUT` | `/api/cms` | `content.ts` | `requireRole` | `OWNER`, `CONTENT_MANAGER` | `cMSContent.upsert` | `AdminCMSPage` | Verified | Storefront content builder |
| `GET` | `/api/coupons` | `coupons.ts` | None | Public | `Coupon.findMany` | `useCartStore` | Verified | Lists active promotions |
| `POST` | `/api/coupons` | `coupons.ts` | **NONE** | **PUBLIC (VULNERABLE)** | `Coupon.upsert` | `AdminPricingPage` | **CRITICAL** | **No auth check! Any guest can create coupons!** |
| `POST` | `/api/coupons/validate` | `coupons.ts` | None | Public | `Coupon.findUnique` | `CheckoutPage` | Verified | Validates dates & min order amount |
| `GET` | `/api/customers` | `customers.ts`| `requireRole` | `OWNER`, `ORDER_MGR`, `STAFF`... | `Customer.findMany` | `AdminCustomersPage` | **SECURITY ISSUE** | **STAFF role permitted to list all customer data** |
| `GET` | `/api/customers/:id` | `customers.ts`| `requireRole` | `OWNER`, `ORDER_MGR`, `STAFF` | `Customer.findUnique` | `AdminCustomersPage` | Verified | Includes past 5 orders |
| `PATCH`| `/api/customers/:id/status`| `customers.ts`| `requireRole`| `OWNER`, `ORDER_MANAGER` | `Customer.update` | `AdminCustomersPage` | Verified | Updates `ACTIVE`/`BLOCKED` + tags |
| `PUT` | `/api/customers/:id` | `customers.ts`| `requireRole` | `OWNER` | `Customer.upsert` | None (Direct Admin API) | Verified | Full record replacement |
| `GET` | `/api/health` | `health.ts` | None | Public | `prisma.$queryRaw` | DevOps Monitor | Verified | Checks DB connectivity |
| `GET` | `/api/orders/:id/invoice` | `invoices.ts`| `requireRole` | `OWNER`, `ORDER_MGR`, `FINANCE` | `Invoice.findFirst` | `AdminOrdersPage` | Verified | Returns GST tax breakdown snapshot |
| `POST` | `/api/orders/:id/send-confirmation` | `invoices.ts` | `requireRole` | `OWNER`, `ORDER_MANAGER` | `EmailLog.create` | `AdminOrdersPage` | Verified | Enqueues Brevo confirmation email |
| `GET` | `/api/orders` | `orders.ts` | `requireRole` | `OWNER`, `ORDER_MGR`, `FINANCE` | `Order.findMany` | `useOrderStore` (Admin only) | Verified | **Customer excluded from reading their orders** |
| `GET` | `/api/orders/:id` | `orders.ts` | `requireRole` | `OWNER`, `ORDER_MGR`, `FINANCE` | `Order.findFirst` | `AdminOrdersPage` | Verified | Order lookup by UUID or OrderNumber |
| `POST` | `/api/orders` | `orders.ts` | None | Public | `Order.create`, `Customer.upsert` | Fallback checkout | Verified | Manual order injection endpoint |
| `PATCH`| `/api/orders/:id/status` | `orders.ts` | `requireRole` | `OWNER`, `ORDER_MANAGER` | `Order.update`, `OrderHistory.create` | `AdminOrdersPage` | Verified | Enforces state machine transitions |
| `POST` | `/api/payments/razorpay/create-order` | `payments.ts` | `requireCustomer` | Customer | `Payment.create`, Razorpay API | `CheckoutPage` | Verified | Generates official Razorpay Order ID |
| `POST` | `/api/payments/razorpay/verify` | `payments.ts` | `requireCustomer` | Customer | `Payment.update`, `Order.update` | `CheckoutPage` | Verified | Verifies HMAC-SHA256 signature |
| `POST` | `/api/payments/webhook/razorpay` | `payments.ts` | None (Webhook)| Razorpay Server | `Payment.updateMany`, `EmailLog.create`| Razorpay Cloud | **SECURITY ISSUE** | **Signature check bypassed if secret is empty** |
| `POST` | `/api/pricing/bulk/preview` | `pricing.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | Calculation only (No DB write) | `AdminPricingPage` | Verified | Returns delta preview of prices |
| `POST` | `/api/pricing/bulk/apply` | `pricing.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `Product.updateMany`, `PricingAuditLog` | `AdminPricingPage` | Verified | Applies markup across category |
| `POST` | `/api/pricing/bulk/rollback/:id` | `pricing.ts`| `requireRole`| `OWNER`, `FINANCE`, `PRODUCT_MGR` | `Product.update`, `AuditLog.update` | `AdminPricingPage` | Verified | Restores original prices |
| `GET` | `/api/pricing/gemstones` | `pricing.ts` | None | Public | `GemstonePriceRule.findMany` | `AdminPricingPage` | Verified | Rates per carat |
| `POST` | `/api/pricing/gemstones` | `pricing.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `GemstonePriceRule.upsert` | `AdminPricingPage` | Verified | Updates gemstone per carat rates |
| `GET` | `/api/pricing/categories` | `pricing.ts` | None | Public | `CategoryPricingRule.findMany` | `AdminPricingPage` | Verified | Markup percentages |
| `POST` | `/api/pricing/categories` | `pricing.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `CategoryPricingRule.upsert` | `AdminPricingPage` | Verified | Updates category rules |
| `GET` | `/api/pricing/audit-logs` | `pricing.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `PricingAuditLog.findMany` | `AdminPricingPage` | Verified | History log |
| `GET` | `/api/pricing/audit-logs/export`| `pricing.ts`| `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `PricingAuditLog.findMany` | `AdminPricingPage` | Verified | CSV file download |
| `GET` | `/api/metal-rates` | `rates.ts` | None | Public | `MetalRate.findMany` | `useMetalRateStore` | Verified | Returns latest gram spot rates |
| `POST` | `/api/metal-rates/bulk` | `rates.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `MetalRate.create` in transaction | `AdminMetalRatesPage` | Verified | Multi-metal publishing batch |
| `POST` | `/api/metal-rates` | `rates.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `MetalRate.create` | `AdminMetalRatesPage` | Verified | Single metal rate insert |
| `POST` | `/api/metal-rates/:id/rollback` | `rates.ts` | `requireRole` | `OWNER`, `FINANCE`, `PRODUCT_MGR` | `MetalRate.create` | `AdminMetalRatesPage` | Verified | Reverts rate to previous |
| `GET` | `/api/wishlist` | `wishlist.ts` | `requireCustomer` | Customer | `WishlistItem.findMany` | `useWishlistStore` | Verified | Returns array of product IDs |
| `POST` | `/api/wishlist/items` | `wishlist.ts` | `requireCustomer` | Customer | `WishlistItem.upsert` | `useWishlistStore.toggle` | Verified | Adds item to wishlist |
| `DELETE`| `/api/wishlist/items/:id` | `wishlist.ts` | `requireCustomer`| Customer | `WishlistItem.deleteMany` | `useWishlistStore.toggle` | Verified | Removes item from wishlist |
| `DELETE`| `/api/wishlist` | `wishlist.ts` | `requireCustomer` | Customer | `WishlistItem.deleteMany` | `useWishlistStore.clear` | Verified | Empties customer wishlist |

---

## 2. Critical Security Findings

### 🔴 Critical Security Vulnerability 1: Unauthenticated Coupon Creation
* **Endpoint:** `POST /api/coupons` ([`backend/src/routes/coupons.ts#L25-L36`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/coupons.ts#L25-L36))
* **Vulnerability:** The route lacks `requireRole` or `requireAdmin`. Any anonymous user can send a POST request with an arbitrary coupon payload (e.g. `discountPercentage: 100`) and the server will execute `prisma.coupon.upsert()`.
* **Fix Required:** Add `requireRole('OWNER', 'PRODUCT_MANAGER', 'FINANCE')` middleware to `POST /api/coupons`.

### 🔴 Critical Security Vulnerability 2: Webhook HMAC Bypass on Empty Secret
* **Endpoint:** `POST /api/payments/webhook/razorpay` ([`backend/src/routes/payments.ts#L246-L251`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/payments.ts#L246-L251))
* **Vulnerability:** The code checks `if (env.razorpayWebhookSecret) { ... }`. In `.env`, `RAZORPAY_WEBHOOK_SECRET=""`. When empty, the HMAC signature validation is completely skipped, allowing anyone to forge a `payment.captured` webhook and falsely mark unpaid orders as `PAID`!
* **Fix Required:** Require a non-empty `RAZORPAY_WEBHOOK_SECRET` in production and reject webhooks immediately if missing.

### 🟡 High Security Flaw 3: Over-Privileged `STAFF` Access to Customer PII
* **Endpoint:** `GET /api/customers` ([`backend/src/routes/customers.ts#L20-L22`](file:///c:/Users/Rakshitha/Downloads/Gurudiamonds/backend/src/routes/customers.ts#L20-L22))
* **Evidence:** In `tests/api/commerce.test.ts:93`, `GET /api/customers denies STAFF` expected 403 Forbidden but received 200 OK.
* **Impact:** Store floor staff accounts have full access to export/view customer names, phone numbers, email addresses, and total order expenditures, violating Indian DPDP Act (Digital Personal Data Protection) principles of least privilege.
* **Fix Required:** Remove `'STAFF'` from `requireRole('OWNER', 'ORDER_MANAGER', 'FINANCE')` in `customers.ts`.

