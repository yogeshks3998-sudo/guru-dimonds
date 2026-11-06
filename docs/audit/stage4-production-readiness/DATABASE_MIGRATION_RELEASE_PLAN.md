# GURU DIAMONDS — DATABASE MIGRATION RELEASE PLAN

**Repository:** `https://github.com/yogeshks3998-sudo/guru-dimonds`  
**ORM:** Prisma 5.x / PostgreSQL 15+  
**Audit Stage:** Final Pre-Deployment Release Gate  
**Risk Level:** Low (100% Non-Destructive Additive Changes)  

---

## 1. Schema Delta & Modification Audit

A comprehensive comparison between the baseline production database schema and the current `prisma/schema.prisma` across Stages 1–4 reveals that all modifications are strictly **additive and non-destructive**.

### 1.1 Summary of Models and Modifications
1. **New Table: `Coupon` (Stage 1)**
   - Fields: `id`, `code` (Unique), `discountType`, `discountValue`, `minOrderAmount`, `maxDiscountAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isActive`, `createdAt`, `updatedAt`.
   - Foreign Keys: None.
   - Impact: Completely new independent table. Zero impact on existing tables.

2. **Updated Model: `ProductVariant` (Stage 2)**
   - Changes: Retained existing primary key `id` as stable identifier; strengthened foreign key relations to `Product`.
   - Relations: `OrderItem` and `CartItem` reference `variantId` optionally; historical records are preserved even if variant stock is modified.
   - Impact: Zero column drops or renames.

3. **New Table: `Inquiry` (Stage 3)**
   - Fields: `id`, `name`, `email`, `phone`, `subject`, `message`, `status` (Default: `NEW`), `createdAt`, `updatedAt`.
   - Foreign Keys: None.
   - Impact: Completely new table for persisting storefront contact inquiries.

4. **Updated / Added Table: `EmailLog` (Stage 3 & 4)**
   - Fields: `id`, `orderId`, `recipient`, `subject`, `status`, `provider`, `messageId`, `error`, `createdAt`.
   - Relations: Optional link to `Order`.
   - Impact: Captures transactional email delivery audit logs without breaking existing orders.

---

## 2. Destructive Action Risk Assessment

| Potential Risk | Evaluation | Mitigation |
|---|---|---|
| Dropped Tables | **NONE** | No existing tables are dropped or truncated. |
| Dropped Columns | **NONE** | No existing columns are removed. |
| Column Renames | **NONE** | All existing column identifiers remain unchanged. |
| Non-Nullable Columns Without Defaults | **NONE** | All new fields have default values (e.g. `isActive = true`, `usedCount = 0`, `status = 'NEW'`) or are optional (`String?`). |
| Data Type Conversions | **NONE** | No columns have altered data types or precision truncations. |

---

## 3. Pre-Migration Backup Protocol

Before running any migration on the production database, the DevOps engineer must capture a full logical backup:

```bash
# 1. Capture logical snapshot using pg_dump
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="gurudiamonds_pre_release_$(date +%Y%m%d_%H%M%S).dump"

# 2. Verify snapshot integrity
pg_restore --list "gurudiamonds_pre_release_*.dump" | head -n 20
```

---

## 4. Production Migration Execution Sequence

In production, never execute `prisma db push` (which can prompt for data loss). Always use `prisma migrate deploy`:

```bash
# Execute within Render build/release command or via SSH terminal
npx prisma migrate deploy
```

### Render Deployment Configuration:
In the Render Service Dashboard for the backend:
- **Build Command:** `npm install && npx prisma generate && npm run build:server`
- **Pre-Deploy Command (Release Command):** `npx prisma migrate deploy`
- **Start Command:** `npm run start`

---

## 5. Post-Migration Verification Queries

Execute these queries against the production PostgreSQL instance to confirm successful schema application:

```sql
-- 1. Verify existence of new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('Coupon', 'Inquiry', 'EmailLog', 'ProductVariant', 'Order');

-- 2. Verify Coupon table constraints
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Coupon';

-- 3. Verify Inquiry table constraints
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'Inquiry';

-- 4. Verify existing product and order count integrity
SELECT count(*) AS total_products FROM "Product";
SELECT count(*) AS total_orders FROM "Order";
```

---

## 6. Rollback & Disaster Recovery Plan

If the migration fails or database performance degrades:
1. **Application Rollback:** Revert backend service in Render to previous deploy container.
2. **Database Rollback:**
   ```bash
   # Restore logical backup if necessary
   pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" gurudiamonds_pre_release_*.dump
   ```
   *(Note: Because changes are strictly additive, reverting application code without database restoration is also safe for backward compatibility).*
