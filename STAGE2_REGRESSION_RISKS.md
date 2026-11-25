# STAGE 2 REGRESSION RISK ASSESSMENT & FAILURE MODE ANALYSIS

## Risk Matrix

| Risk Item | Likelihood | Impact | Mitigations Implemented & Verified | Residual Risk |
|---|---|---|---|---|
| **1. SKU Collision during variant update** | Low | Medium | Strict pre-transaction check rejects duplicate SKUs within request (`HTTP 400`) and cross-product SKU collisions (`HTTP 400`). | Negligible |
| **2. Orphaned Cart Items** | Medium | High | Variants referenced by active carts are retired with `enabled: false` instead of deleted. Active cart references remain valid. | Negligible |
| **3. Historical Order Item Broken References** | Low | Critical | Variants referenced by order history are strictly retained in the database (`enabled: false`). | None |
| **4. IDOR on Order Lookup** | Low | High | `GET /api/orders/:id` verifies customer JWT token subject matches `order.customerId`. Non-owners receive `HTTP 403`. | None |
| **5. Inventory Double-Count on Order Cancellation** | Low | Medium | Inventory replenishment is only executed when status moves to `CANCELLED` from an uncancelled state. | Negligible |
| **6. Frontend Blank Screen on Order History Load** | Low | Medium | `CustomerAccountPage.tsx` handles `loadingOrders` and `orderError` gracefully with visual loading and fallback messages. | None |

---

## Detailed Failure Mode Analysis

### Failure Mode A: Variant SKU Update
- **Scenario:** An admin attempts to change a variant's SKU to one that already exists on a different product variant.
- **Old Behavior:** PostgreSQL threw an unhandled unique constraint error resulting in `HTTP 500` server crash.
- **New Behavior:** `backend/src/routes/catalog.ts` validates incoming SKUs against `prisma.productVariant.findUnique` before the transaction begins. If a conflict belongs to another product, it returns a descriptive `HTTP 400 Bad Request` (`"SKU <sku> is already in use by another product variant"`).

### Failure Mode B: Deletion of a Variant Purchased in Past Orders
- **Scenario:** An admin removes a ring size variant (e.g. Size 12) from the product catalog that was previously ordered by 10 customers.
- **Old Behavior:** `deleteMany` attempted to delete the variant. If foreign key cascade was triggered, historical orders lost line items; if restrict was configured, the entire product edit crashed with `HTTP 500`.
- **New Behavior:** The system queries `tx.orderItem.count({ where: { variantId } })`. Because the count is greater than zero, the variant is **not deleted**; it is marked `enabled: false`. Customers can view past orders with accurate line items, while the storefront no longer offers Size 12 for purchase.

### Failure Mode C: Customer Viewing Another Customer's Order
- **Scenario:** Customer B obtains Customer A's order UUID or number and attempts `GET /api/orders/<uuid>`.
- **Old Behavior:** Prior to remediation, order details could be returned without customer validation if the caller possessed any valid token.
- **New Behavior:** `GET /api/orders/:id` checks whether the authenticated caller is an authorized admin (`OWNER`, `ORDER_MANAGER`, `FINANCE`). For customers, it enforces `order.customerId === auth.sub`. If mismatched, it immediately throws `HttpError(403, 'You do not have permission to view this order')`.

