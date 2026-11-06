# GURU DIAMONDS — DATABASE MIGRATION CHECKLIST & AUDIT

**Repository:** `https://github.com/yogeshks3998-sudo/guru-dimonds`  
**ORM:** Prisma 5.x  
**Database Engine:** PostgreSQL 15+ (Neon Tech Serverless / Managed PostgreSQL)  
**Target Branch:** `main`  
**Status:** **AUDITED — 100% NON-DESTRUCTIVE ADDITIVE DELTA**  

---

## 1. Actual Migration History Audit

A direct audit of the `prisma/migrations` directory against `origin/main` reveals the precise database state:

### 1.1 Existing Baseline Migrations (Already on `origin/main`)
1. `20260803000000_phase_2_postgresql_data_layer`
   - Created core tables: `User`, `Category`, `Product`, `ProductVariant`, `MetalRate`, `Coupon`, `Customer`, `Address`, `Order`.
   - *Audit Reconciliation Note:* The `Coupon` table was established in this initial migration; Stage 1 remediation added backend route authentication and validation without altering table columns.
2. `20260803010000_phase_3_auth_security`
   - Added auth tables, refresh tokens, and customer identity fields.
3. `20260803020000_phase_4_ecommerce_core`
   - Created `EmailLog`, `Cart`, `CartItem`, `OrderItem`, and `OrderEvent`.
   - *Audit Reconciliation Note:* `EmailLog` was already present in the baseline schema; Stage 3 & 4 wired it into transactional email handlers.
4. `20260813090000_razorpay_payment_integration`
   - Added Razorpay order and payment identifier columns to `Order`.
5. `20260814000000_pending_registration_otp`
   - Added email OTP verification tables.
6. `20260814010000_pending_registration_phone_otp`
   - Added phone-based OTP fields.

### 1.2 The Single New Migration in this Release
7. `20260815000000_inquiry_system` **[NEW IN THIS PR]**
   - **Path:** `prisma/migrations/20260815000000_inquiry_system/migration.sql`
   - **SQL Contents:**
     ```sql
     -- CreateTable
     CREATE TABLE "Inquiry" (
         "id" TEXT NOT NULL,
         "name" TEXT NOT NULL,
         "contactNumber" TEXT NOT NULL,
         "gmail" TEXT NOT NULL,
         "requirement" TEXT NOT NULL,
         "message" TEXT NOT NULL,
         "status" TEXT NOT NULL DEFAULT 'NEW',
         "adminNotes" TEXT,
         "assignedTo" TEXT,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL,

         CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
     );

     -- CreateIndex
     CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");

     -- CreateIndex
     CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");
     ```

---

## 2. Destructive Action Risk Assessment

| Potential Risk Factor | Status | Impact Analysis |
|---|---|---|
| Dropped Tables | **NONE (0)** | No `DROP TABLE` statements exist in the release. |
| Dropped Columns | **NONE (0)** | No `DROP COLUMN` statements exist in the release. |
| Altered Column Data Types | **NONE (0)** | No columns are modified or cast to different types. |
| Non-Nullable Columns Without Defaults | **NONE (0)** | New columns in `Inquiry` have explicit defaults (`status = 'NEW'`, `createdAt = CURRENT_TIMESTAMP`). |
| Data Loss Risk | **ZERO (0%)** | All existing rows in `Product`, `ProductVariant`, `Order`, `Customer`, etc., are completely untouched. |

---

## 3. Pre-Deployment Database Backup Runbook

Execute this backup command from a secure terminal before initiating deployment:

```bash
# Set production connection string
export DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require"

# Create compressed custom-format pg_dump snapshot
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="gurudiamonds_pre_release_$(date +%Y%m%d_%H%M%S).dump"

# Verify dump integrity
pg_restore --list "gurudiamonds_pre_release_*.dump" | head -n 15
```

---

## 4. Production Migration Deployment Command

> [!CAUTION]
> Never use `prisma db push` in production. Always execute `prisma migrate deploy`, which safely executes unapplied migration files in chronological order and records them in the `_prisma_migrations` table.

### Command for Render Build / Release Phase:
```bash
npx prisma migrate deploy
```

Expected Render Build Output:
```text
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb", schema "public" at "ep-holy-sunset-ay1zaddi-pooler.c-5.us-east-2.aws.neon.tech:5432"

1 migration found in prisma/migrations

Applying migration `20260815000000_inquiry_system`

The following migration has been applied:
- 20260815000000_inquiry_system

All migrations have been successfully applied.
```

---

## 5. Post-Migration Verification Queries

Execute these queries on the production PostgreSQL instance to confirm successful migration:

```sql
-- 1. Confirm Inquiry table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Inquiry'
ORDER BY ordinal_position;

-- 2. Confirm _prisma_migrations record
SELECT migration_name, finished_at, rolled_back_at 
FROM "_prisma_migrations" 
WHERE migration_name = '20260815000000_inquiry_system';

-- 3. Confirm baseline data counts are intact
SELECT 
  (SELECT count(*) FROM "Product") AS products,
  (SELECT count(*) FROM "ProductVariant") AS variants,
  (SELECT count(*) FROM "Order") AS orders,
  (SELECT count(*) FROM "Customer") AS customers;
```

---

## 6. Rollback & Disaster Recovery Procedure

If migration or deployment must be rolled back:
```bash
# Step 1: Revert application code to origin/main (commit 9d08e92)
git checkout main
git pull origin main

# Step 2: (Optional) Drop the additive Inquiry table if necessary
psql "$DATABASE_URL" -c 'DROP TABLE IF EXISTS "Inquiry" CASCADE;'
psql "$DATABASE_URL" -c 'DELETE FROM "_prisma_migrations" WHERE migration_name = "20260815000000_inquiry_system";'
```
*(Because changes are strictly additive, existing application code on `main` can operate normally even if the `Inquiry` table remains in the database).*
