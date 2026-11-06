# 04. DATABASE MIGRATION & PRODUCTION DATA SAFETY

**Target:** `docs/audit/stage4-production-readiness/04_DATABASE_MIGRATION_SAFETY.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** PostgreSQL Database Reliability Engineer & Principal Architect  
**Scope:** Migration Integrity, Schema Safety, Record Preservation, and Rollback Operations  

---

## 1. Executive Summary

A comprehensive schema and SQL audit was conducted across all 7 Prisma migrations in `prisma/migrations/`. 

**Findings:**
- **Destructive Operations:** ZERO. No `DROP TABLE`, `DROP COLUMN`, or `TRUNCATE` operations exist in the pending Stage 3 migration or any core e-commerce migration.
- **Stage 3 Migration (`20260815000000_inquiry_system`):** 100% additive. Creates table `"Inquiry"` and two non-blocking B-tree indexes (`Inquiry_status_idx`, `Inquiry_createdAt_idx`).
- **Data Integrity Risk:** ZERO. Existing records in `Product`, `Customer`, `Order`, `OrderItem`, `Payment`, and `CMSContent` remain completely untouched.

---

## 2. Chronological Migration History

| Migration Directory | Applied | Changes | Destructive SQL | Lock Risk |
| :--- | :---: | :--- | :---: | :---: |
| `20260803000000_phase_2_postgresql_data_layer` | Yes | Core entities: Product, Category, Customer, Order | None | None |
| `20260803010000_phase_3_auth_security` | Yes | AdminUser, AuditLog, PricingRule | None | None |
| `20260803020000_phase_4_ecommerce_core` | Yes | Cart, CartItem, WishlistItem, Payment, Invoice | None | None |
| `20260813090000_razorpay_payment_integration` | Yes | Payment fields for Razorpay provider order ID | None | None |
| `20260814000000_pending_registration_otp` | Yes | PendingRegistration table for OTP verification | None | None |
| `20260814010000_pending_registration_phone_otp` | Yes | Dropped email uniqueness on OTP table for phone-first auth | Safe index drop on transient table | None |
| `20260815000000_inquiry_system` (Stage 3) | Ready | Creates `InquiryStatus` enum, `Inquiry` table, and 2 indexes | **None (Purely Additive)** | **None** |

---

## 3. Pre-Migration Prerequisites & Backup Procedure

Before applying migrations to the production database:

### A. Neon Cloud Point-in-Time Snapshot
1. Open Neon Console -> Guru Diamonds Project -> Branches.
2. Create a named snapshot branch: `backup-pre-stage3-migration-20261106`.
3. Verify snapshot readiness before proceeding.

### B. Logical Backup via `pg_dump`
Execute standard compressed dump targeting the production connection string:
```bash
pg_dump "$DATABASE_URL" \
  --format=custom \
  --file=guru_diamonds_pre_stage3_backup.dump \
  --verbose \
  --no-owner \
  --no-privileges
```

---

## 4. Pre-Migration Integrity Verification SQL

Run these queries against production prior to migration to capture record baselines:

```sql
SELECT 'Customer' AS entity, COUNT(*) AS total_count FROM "Customer"
UNION ALL
SELECT 'Order', COUNT(*) FROM "Order"
UNION ALL
SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL
SELECT 'ProductVariant', COUNT(*) FROM "ProductVariant"
UNION ALL
SELECT 'Payment', COUNT(*) FROM "Payment"
UNION ALL
SELECT 'CMSContent', COUNT(*) FROM "CMSContent";
```

Record baseline counts to confirm complete data preservation post-migration.

---

## 5. Migration Execution Plan

Execute on deployment runner (or Render build script):

```bash
# 1. Apply all pending migrations safely
npx prisma migrate deploy

# 2. Regenerate Prisma client binding
npx prisma generate
```

### Safety Guarantees During Rollout:
- Because the `Inquiry` table is brand-new, existing running instances of the application on Stage 2 will experience zero disruption or locking when the migration runs.
- The migration is forward and backward compatible.

---

## 6. Post-Migration Verification SQL

Execute the following verification script immediately following migration deployment:

```sql
-- 1. Confirm Inquiry table exists and has correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Inquiry'
ORDER BY ordinal_position;

-- 2. Confirm B-tree indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'Inquiry';

-- 3. Confirm existing records remain identical to baseline
SELECT 'Customer' AS entity, COUNT(*) AS total_count FROM "Customer"
UNION ALL
SELECT 'Order', COUNT(*) FROM "Order"
UNION ALL
SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL
SELECT 'ProductVariant', COUNT(*) FROM "ProductVariant"
UNION ALL
SELECT 'Payment', COUNT(*) FROM "Payment"
UNION ALL
SELECT 'CMSContent', COUNT(*) FROM "CMSContent";
```

---

## 7. Rollback & Forward Recovery Procedures

### Scenario: Migration Fails or Needs Immediate Reversal
Because the `Inquiry` table has no foreign key cascades pointing to it from other tables, rollback is zero-risk:

```sql
-- Reversible Rollback SQL
DROP TABLE IF EXISTS "Inquiry";
DROP TYPE IF EXISTS "InquiryStatus";
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260815000000_inquiry_system';
```

No data in other tables will be affected, and previous application versions will continue functioning normally.
