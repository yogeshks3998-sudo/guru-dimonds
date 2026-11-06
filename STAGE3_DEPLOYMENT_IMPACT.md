# STAGE 3 DEPLOYMENT IMPACT & EXECUTION PLAN

## 1. Overview
Stage 3 introduces additive, non-breaking changes across the Guru Diamonds full-stack application:
- PostgreSQL persistence for customer inquiries (`Inquiry` model)
- Secure, rate-limited public order tracking endpoint (`/api/orders/track/:reference`)
- Database-backed dynamic and build-time SEO sitemaps
- Authoritative CMS store synchronization with anti-XSS validation

All changes are strictly non-destructive. No existing tables, columns, constraints, foreign keys, or database records are altered or dropped.

---

## 2. Deployment Sequence & Operational Order

To guarantee zero downtime and eliminate race conditions, the deployment must proceed in three strictly sequential phases:

```
[Phase 1: Database Migration]
           │
           ▼
[Phase 2: Backend API Deployment]
           │
           ▼
[Phase 3: Frontend Client Deployment]
```

### Phase 1: Database Migration (Pre-deployment)
1. **Command:**
   ```bash
   npx prisma migrate deploy
   ```
2. **Impact Analysis:**
   - **Migration File:** `prisma/migrations/20260815000000_inquiry_system/migration.sql`
   - **Operations:**
     - `CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'RESPONDED', 'ARCHIVED');`
     - `CREATE TABLE "Inquiry" (...);`
     - `CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");`
     - `CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");`
   - **Locking:** Table creation and index creation on a newly created table do not lock existing tables (`User`, `Order`, `Product`, etc.).
   - **Downtime:** 0.00 seconds. Existing application continues normal operations.

### Phase 2: Backend Service Deployment
1. **Artifacts:**
   - Compiled backend server (`dist/app.js`, `dist/routes/inquiries.js`, `dist/routes/seo.js`, `dist/routes/orders.js`).
2. **Readiness Checks:**
   - Verify environment variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
   - Healthcheck: `GET /health` returns HTTP 200.
3. **Compatibility:**
   - If frontend is still on Stage 2, backend remains fully backward compatible:
     - Stage 2 endpoints (`/api/orders`, `/api/catalog`, `/api/auth`) are unaltered.
     - New endpoints (`/api/inquiries`, `/api/orders/track/:reference`, `/sitemap.xml`) are live and ready to receive traffic.

### Phase 3: Frontend Client Deployment
1. **Artifacts:**
   - Production static assets generated via `npm run build` (including sitemap generated via `npm run build:seo`).
2. **Verification:**
   - `ContactPage`: Submitting contact inquiries issues `POST /api/inquiries` and displays success toast.
   - `TrackOrderPage`: Displays empty search form; submitting valid order number queries `/api/orders/track/:reference`.
   - `AdminInquiriesPage`: Loads inquiries from `/api/inquiries` with status update capabilities.
   - `AdminCMSPage`: Modifying footer or announcements persists to `/api/cms` and reflects immediately in storefront footer.

---

## 3. Backward & Forward Compatibility

| Layer | Compatibility Assessment | Fallback Mechanism |
| :--- | :--- | :--- |
| **Database** | 100% Backward Compatible. Only creates a new isolated table `Inquiry`. | N/A (no preexisting queries hit `Inquiry`). |
| **Backend API** | 100% Backward Compatible. Extends API surface without modifying existing route signatures. | Fallback error handlers catch and log any unanticipated request formats. |
| **Frontend Store** | Tolerant to network / API failures. | `useCMSStore` provides fallback defaults if API unreachable; `generate-seo.ts` falls back to core static paths if DB unavailable during build. |
| **Order Tracking** | Replaces insecure client-side `orders[0]` lookup with secure public API query. | Invalid or non-existent order numbers return clean 404 with helpful user guidance. |

---

## 4. Rollback Strategy

Should an unexpected issue occur during deployment, rollback can be achieved without data loss or downtime:

### Scenario A: Frontend Issue
- **Action:** Redeploy previous static bundle (Stage 2 frontend).
- **Result:** Frontend resumes using local inquiry store / previous tracking behavior. Backend remains on Stage 3 with zero errors.

### Scenario B: Backend Service Issue
- **Action:** Roll back backend service container or restart previous release.
- **Result:** Stage 2 routes continue functioning. Database migration remains in place (harmless).

### Scenario C: Database Migration Rollback
- In the exceedingly rare case where the `Inquiry` table must be removed:
  ```sql
  DROP TABLE IF EXISTS "Inquiry";
  DROP TYPE IF EXISTS "InquiryStatus";
  ```
- No foreign key cascades or dependencies exist on other tables. Zero impact on core e-commerce data.

---

## 5. Deployment Verification Checklist

- [x] Run database migration: `npx prisma migrate deploy` (or verified via `npx prisma db push` in test environment).
- [x] Generate updated Prisma client: `npx prisma generate`.
- [x] Build backend TypeScript: `npm run build:api`.
- [x] Run SEO generator: `npm run build:seo`.
- [x] Build frontend Vite bundle: `npm run build`.
- [x] Execute backend integration test suite: `npx jest tests/backend/stage3-integration.test.ts`.
- [x] Execute full regression test suites (Stage 1 Security, Stage 2 Integrity, Commerce, Vitest).
- [x] Confirm no secrets, API keys, or test credentials leaked in build artifacts.
