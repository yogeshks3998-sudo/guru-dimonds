# STAGE 3 DATABASE MIGRATIONS & SCHEMA ARCHITECTURE

## Executive Summary
Stage 3 introduces a single additive database schema modification to support persistent contact inquiries. No existing tables, columns, constraints, foreign keys, or historical records were modified or dropped.

---

## Schema Changes

### 1. New Model: `Inquiry` (`prisma/schema.prisma`)
```prisma
model Inquiry {
  id            String   @id @default(cuid())
  name          String
  contactNumber String
  gmail         String
  requirement   String
  message       String
  status        String   @default("NEW")
  adminNotes    String?
  assignedTo    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
}
```

### 2. Migration DDL (`prisma/migrations/20260815000000_inquiry_system/migration.sql`)
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

## Safety and Backward Compatibility Verification
1. **Zero Destructive Operations:** The migration executes `CREATE TABLE` and `CREATE INDEX` only. No `ALTER TABLE DROP`, `ALTER TABLE RENAME`, or `DROP TABLE` operations exist.
2. **PostgreSQL Compatibility:** Tested and verified on Neon PostgreSQL 16.
3. **Isolation Guarantee:** Applied only to the local/staging database connection. No automated production DDL was executed.
4. **Data Isolation:** Historical orders, customer accounts, payment records, product catalogs, and inventory remain 100% unaltered.
