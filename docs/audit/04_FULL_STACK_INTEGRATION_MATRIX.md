# 04 — FULL-STACK INTEGRATION MATRIX & END-TO-END DATA TRACING
**Project:** Guru Diamonds  
**Audit Date:** November 6, 2026  
**Auditor Role:** Senior Full-Stack Architect  
**Status:** COMPLETE & EVIDENCE-BASED  

---

## 1. End-to-End Feature Tracing & Integration Matrix

Below is the verified integration mapping from UI User Action through API Clients, Controllers, Database transactions, and back to UI state:

| Feature / User Flow | Frontend Trigger | Endpoint Called | Backend Logic & Validation | Database Operation | Read Verified | Write Verified | End-to-End Status | Discrepancy / Breakdown |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Catalog Browsing** | User visits `/shop` or changes filters | `GET /api/products` | Status filtering (`ACTIVE`), category matching, includes `variants` | `Product.findMany` with relations | Yes | N/A | **WORKING** | Large payload transfer due to Base64 image data. |
| **Formula Product Price** | User opens `/product/:slug` | `GET /api/products/:slug`, `GET /api/metal-rates` | Fetches live metal rates per gram and product specs | `Product.findUnique`, `MetalRate.findMany` | Yes | N/A | **WORKING** | Live gold/silver spot rate accurately recalculated with 3% GST. |
| **Cart Management** | User adds/edits item in bag | `POST /api/cart/items`, `PATCH /api/cart/items/:id` | Validates stock and active variant; checks customer auth | `Cart.upsert`, `CartItem.create`/`update` | Yes | Yes | **WORKING** | Merges guest cart to customer database cart upon login. |
| **Coupon Validation** | User inputs coupon at `/checkout` | `POST /api/coupons/validate` | Checks code, date window, minimum order threshold | `Coupon.findUnique` | Yes | N/A | **WORKING** | Discounts applied to subtotal in server and client calculation. |
| **Order Placement (COD)** | Customer confirms COD order | `POST /api/checkout/create-order` | Validates customer, recalculates totals, verifies payment method is `COD` | `prisma.$transaction`: `decrementInventory`, `Customer.update`, `Order.create`, `Invoice.create` | Yes | Yes | **WORKING** | Complete atomic transaction with stock decrements. |
| **Order Placement (Razorpay)**| Customer pays via UPI/Card | `POST /api/payments/razorpay/create-order` $\to$ `verify` | Creates Razorpay order, opens modal, verifies HMAC-SHA256 signature | `prisma.$transaction`: `Payment.create`/`update`, `Order.create`, `decrementInventory` | Yes | Yes | **WORKING** | Safe payment handling; live Razorpay keys loaded in `.env`. |
| **Customer Order History** | Customer opens `/account` tab | **None** (Tries to read `useOrderStore.orders`) | `GET /api/orders` rejected with 403 Forbidden | `Order.findMany` (Blocked) | No | No | **BROKEN** | **Frontend has no customer order endpoint.** Reads only from local browser memory. |
| **Public Order Tracking** | User submits tracking form on `/track-order` | **None** (Queries local `useOrderStore`) | No backend lookup endpoint exists | None | No | No | **NOT CONNECTED** | Guest cannot track orders placed on another device. |
| **Contact Inquiry Submission**| Visitor submits form on `/contact` | **None** (Calls `useInquiryStore.addInquiry`) | No backend controller or service exists | None | No | No | **NOT CONNECTED** | Saved only to visitor's local browser `localStorage`. |
| **Admin Inquiries Dashboard** | Admin views `/admin/inquiries` | **None** (Calls `useInquiryStore.hydrateInquiries`) | No backend controller exists | None | No | No | **NOT CONNECTED** | Admin sees only their own browser's mock inquiries. |
| **Bullion Rate Publishing** | Admin updates rates on `/admin/metal-rates` | `POST /api/metal-rates/bulk` | Validates purity/metal, role authorization (`FINANCE`/`OWNER`) | `prisma.$transaction`: `MetalRate.create` in batch | Yes | Yes | **WORKING** | Instant storefront ticker update; rollback button functional. |
| **Bulk Price Adjustment** | Admin runs markup on `/admin/pricing` | `POST /api/pricing/bulk/preview` $\to$ `apply` | Calculates category delta; updates records with audit trail | `Product.updateMany`, `PricingAuditLog.create` | Yes | Yes | **WORKING** | Includes one-click rollback mechanism. |
| **Admin Product Creation** | Admin submits `/admin/products/new` | `POST /api/products` | Validates required fields, role permission | `Product.create`, `variants`, `media`, `inventoryItems` | Yes | Yes | **WORKING** | Base64 image strings written to Postgres `Json` column. |
| **Admin Product Edit** | Admin updates `/admin/products/edit/:id`| `PUT /api/products/:id` | Deletes all variants and recreates them | `Product.update`, `variants.deleteMany` | Yes | Risk | **PARTIALLY WORKING** | Will fail with Foreign Key violation if an order references a deleted `variantId`. |
| **Admin Order Status Transition**| Admin advances order to `SHIPPED` | `PATCH /api/orders/:id/status` | Enforces state machine (`canTransitionOrderStatus`) | `Order.update`, `OrderHistory.create`, `sendOrderStatusEmail` | Yes | Yes | **WORKING** | Logs tracking ID and triggers email notification. |

---

## 2. Identified Full-Stack Integration Gaps

```mermaid
graph TD
    subgraph Storefront
        CustomerAccount["/account (Order History)"] -.->|Missing Endpoint (Gets 403)| BlockedOrderAPI["GET /api/orders"]
        ContactForm["/contact (Submit Inquiry)"] -.->|No API Exists!| LocalInquiryStore["localStorage: guru_diamonds_contact_inquiries"]
        OrderTracking["/track-order (Lookup)"] -.->|No Backend Lookup!| LocalOrderStore["localStorage: guru_diamonds_orders_v1"]
    end
    subgraph AdminPortal
        AdminInquiry["/admin/inquiries"] -.->|Reads Local Only| LocalInquiryStore
    end
```

### Gap 1: Missing Customer Order History Endpoint
* **Issue:** When a customer logs into `/account`, the frontend attempts to read `customerOrders` from `useOrderStore.orders`. However, `hydrateOrders()` is only triggered when `isAdminLoggedIn === true` because `GET /api/orders` requires `OWNER`, `ORDER_MANAGER`, or `FINANCE` roles.
* **Result:** A real customer logging into their account on any browser sees "No past orders found" unless the order was placed in that exact browser session and is still in `localStorage`.
* **Required Fix:** Implement `GET /api/customer/orders` with `requireCustomer` middleware returning `prisma.order.findMany({ where: { customerId: req.auth.sub } })`.

### Gap 2: Contact Inquiries Are 100% Disconnected From Backend
* **Issue:** The contact form on `/contact` submits data via `useInquiryStore.addInquiry()`, which writes exclusively to browser `localStorage` under `guru_diamonds_contact_inquiries`.
* **Result:** When a customer asks for a quote or custom order, **store administrators on their own computers never receive it**. The admin `/admin/inquiries` page only reads the admin's own local storage!
* **Required Fix:** Create a Prisma `ContactInquiry` model and endpoints `POST /api/inquiries` and `GET /api/inquiries`.

### Gap 3: Public Order Tracking Has No Database Query
* **Issue:** `/track-order` takes an Order ID and Mobile number, but filters against `useOrderStore.orders` in memory instead of executing a backend lookup.
* **Required Fix:** Add public endpoint `POST /api/orders/track` that takes `{ orderNumber, phone }` and returns order shipping status and tracking link.

