# STAGE 2 DATABASE INTEGRITY & TRANSACTION SAFETY REPORT

## Executive Summary
Prior to Stage 2, `PUT /products/:id` executed a destructive sequence:
```ts
// PREVIOUS DESTRUCTIVE IMPLEMENTATION
variants: {
  deleteMany: {},
  create: (product.variants || []).map(toVariantCreateData)
}
```
This naive cascade wipe had severe database integrity repercussions:
1. It violated foreign key integrity for carts and orders referencing variants.
2. It invalidated historical variant IDs stored on customer invoices and order items.
3. It wiped `inventoryItems`, resetting `reserved` stock counts during in-flight checkouts.
4. It created a race condition where concurrent reads saw empty variant sets.

In Stage 2, this was replaced with an ACID-compliant, non-destructive synchronization mechanism designed in strict adherence to relational database best practices.

---

## Transactional Architecture & Invariants

```
                Incoming PUT /products/:id Payload
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
Validate Invariant: Unique SKUs       Validate Invariant: Variant Ownership
(No duplicates in payload)            (No variant ID/SKU theft across products)
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                 BEGIN PRISMA TRANSACTION (tx)
                               │
               Update Core Product Metadata
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
Variant exists in DB?                        Variant is new?
        │                                             │
 ┌──────┴──────┐                                      │
 ▼             ▼                                      │
Update       Keep ID, update attributes,              │
in-place     price, weights, stock in-place           │
        │                                             │
        └──────────────────────┬──────────────────────┘
                               ▼
            Omitted Variants in incoming payload?
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   Referenced by Cart/Order?          Zero Active References?
              │                                 │
              ▼                                 ▼
   RETAIN RECORD IN DATABASE          DELETE UNREFERENCED VARIANT
   Mark enabled: false (Retired)
                               │
                 Upsert Inventory Items
              Preserve existing `reserved`
                               │
                        COMMIT TX
```

### Invariants Maintained

1. **Foreign Key Invariant:**
   - No `ProductVariant` record is ever deleted if it is linked to an active `CartItem` or an existing `OrderItem`.
   - Instead, the variant record is safely retired (`enabled: false`), preserving referential integrity, historical analytics, and receipt lookups.

2. **Cart Continuity Invariant:**
   - When a product is updated while a customer has it in their shopping cart, the cart item remains valid and points to the stable variant ID.

3. **SKU Uniqueness Invariant:**
   - Enforces unique SKUs globally across the entire database as well as locally within incoming product update payloads.

4. **Ownership Invariant:**
   - An administrator cannot inadvertently or maliciously claim a variant ID or SKU belonging to another product (`HTTP 403 Forbidden` / `HTTP 400 Bad Request`).

5. **Inventory Consistency Invariant:**
   - Product updates now upsert inventory items rather than deleting and recreating them.
   - Any currently reserved stock (`reserved > 0`) held by ongoing checkout sessions is strictly preserved.

6. **Order Cancellation Inventory Invariant:**
   - Transitions to `CANCELLED` atomically restore variant stock, product total stock, and warehouse inventory item quantities matching the cancelled order items.

---

## Schema Invariance
- **No Schema Migrations Required:** The existing Prisma schema (`prisma/schema.prisma`) already defined the necessary relations and unique constraints (`ProductVariant.sku @unique`, `OrderItem.variantId`, `CartItem.variantId`).
- **Zero Destructive DDL:** No columns were dropped, no foreign keys altered, and no existing customer or order rows modified.

