# STAGE 3 — SECURE ORDER TRACKING IMPLEMENTATION

## 1. Security Analysis & Remediation
Prior to Stage 3, `TrackOrderPage.tsx` suffered from a serious data leakage pattern:
- **Eager Exposure:** Line 9 executed `useState(orders[0] || null)`, immediately displaying the first mock customer order on initial page load without any user query.
- **Enumeration Vulnerability:** Order lookups checked in-memory arrays without rate limiting or authorization controls, potentially allowing unauthenticated visitors to scrape sequential orders.

---

## 2. Secure Tracking Architecture

### A. Backend Endpoint: `GET /api/orders/track/:reference`
- **Rate Limiting:** Protects against automated sequential enumeration (max 20 lookups per 5-minute sliding window per IP).
- **Identifier Matching:** Case-insensitively matches `orderNumber` (e.g. `GURU-2026-8901`) or Airway Bill `trackingNumber` (e.g. `BLUEDART-891230491`).
- **Authorization & Verification:**
  - Authenticated administrators (`OWNER`, `ORDER_MANAGER`, `FINANCE`, `SUPER_ADMIN`) have unrestricted lookup access.
  - Authenticated customers are permitted to track only their own orders (`order.customerId === auth.sub`).
  - Guest/unauthenticated lookups validate optional contact parameters (`?contact=phone_or_email`) against `order.customerSnapshot` and `order.shippingAddress` to block unauthorized viewers.
- **Strict PII Exclusion (Zero Leakage):**
  The endpoint strictly filters the returned payload. The following fields are **NEVER exposed**:
  - `customer` / `customerSnapshot` (name, email, phone)
  - `shippingAddress` (street, city, pin code)
  - `billingAddress`
  - `totalAmount`, `subtotal`, `discountAmount`, `gstTotal`
  - `paymentMethod`, `paymentStatus`
  - Internal administrative notes or updater credentials

### B. Safe Response Schema
```json
{
  "orderNumber": "GURU-TRACK-1793957432963",
  "orderStatus": "CONFIRMED",
  "courierPartner": "BlueDart Express",
  "trackingNumber": "BLUEDART-1793957432963",
  "placedAt": "2026-11-06T09:28:14.000Z",
  "history": [
    {
      "status": "CONFIRMED",
      "note": "Order confirmed and verified.",
      "timestamp": "2026-11-06T09:28:14.000Z"
    }
  ],
  "items": [
    {
      "productName": "Royal Gomedhika Gemstone Ring",
      "quantity": 1,
      "image": "/products/Rings/gomedhika/main.png"
    }
  ]
}
```

---

## 3. Frontend Integration (`src/pages/TrackOrderPage.tsx`)
1. **Initial Blank State:** Removed `orders[0]` eager display. The page now opens with an empty, clean search interface.
2. **Interactive States:** Added `isLoading`, `errorMessage`, `hasSearched`, and populated order timeline states.
3. **API Integration:** Connects directly to `orderApi.trackOrder(searchQuery.trim())`.
4. **Design Preservation:** Retained 100% of the timeline styles, icons (`Truck`, `Search`, `CheckCircle2`), color schemes, and responsive layout.
