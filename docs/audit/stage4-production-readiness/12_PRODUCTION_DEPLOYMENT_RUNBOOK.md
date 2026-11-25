# 12. PRODUCTION DEPLOYMENT RUNBOOK

**Target:** `docs/audit/stage4-production-readiness/12_PRODUCTION_DEPLOYMENT_RUNBOOK.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** Production DevOps Lead & Site Reliability Engineer  
**Scope:** Step-by-Step Deployment Execution, Zero-Downtime Guarantee, Smoke Testing, and Rollback  

---

## 1. Pre-Deployment Verification Checklist

Before initiating any deployment action, confirm the following gates are green:

- [x] Release branch verified (`audit-remediation-stage4` at approved commit).
- [x] All 125 automated and E2E regression tests passing.
- [x] TypeScript compiler passes with zero errors (`npx tsc --noEmit`).
- [x] Neon database backup / branch snapshot created.
- [x] Render and Vercel environment variables verified.
- [x] No plaintext credentials or testing mock overrides present in repository.
- [x] Zero-downtime assessment: Verified additive migration causes zero table locks.

---

## 2. Zero-Downtime Deployment Sequence

To eliminate race conditions and ensure zero downtime for active users, the release must execute in the following strict order:

```
Step 1: Database Migration ──> Step 2: Render API Backend ──> Step 3: Vercel Frontend
```

### Step 1: Database Migration (Pre-deployment)
1. In the deployment runner or Render build pipeline:
   ```bash
   npx prisma migrate deploy
   ```
2. **Safety Guarantee:** The `Inquiry` table creation and index additions are purely additive. Existing running instances continue operating with zero table locks or downtime.

### Step 2: Deploy Backend API on Render
1. Trigger Render build on the web service (`guru-diamonds`):
   ```bash
   Build Command: npm ci && npm run db:generate && npm run db:deploy && npm run build:api
   Start Command: npm run start:api
   ```
2. **Healthcheck Verification:** Monitor until Render reports healthy on `GET /api/health`.

### Step 3: Deploy Frontend on Vercel
1. Trigger production deployment on Vercel connected to the release branch.
2. Ensure Vercel environment variables are populated:
   - `VITE_API_URL`: `https://guru-dimonds.onrender.com/api`
3. Verify Vercel build succeeds and static assets (including `sitemap.xml`) are published to the edge.

---

## 3. Post-Deployment Smoke Test Protocol

*Note: Per strict safety rules, do not submit real monetary charges or test payments with live customer cards during smoke verification.*

| Smoke Test Check | Target URL | Expected Observation | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- |
| **API Health** | `https://guru-dimonds.onrender.com/api/health` | HTTP 200 `{"ok":true,"service":"guru-diamonds-api"}` | Must return HTTP 200 within 500ms |
| **Homepage** | `https://gurudiamonds.in/` | Serves hero banner, featured rings, header navigation | 0 console exceptions |
| **Product Catalogue** | `https://gurudiamonds.in/shop` | Renders product grid, category counts, filter sidebar | Displays active products |
| **Product Detail** | `https://gurudiamonds.in/product/royal-gomedhika-gemstone-ring` | Renders price, images, ring size selector | Bullion calculations render |
| **Admin Login** | `https://gurudiamonds.in/admin` | Login modal renders; valid admin credentials log in | Redirects to Admin Dashboard |
| **Contact Form** | `https://gurudiamonds.in/contact` | Submit clean test inquiry; displays success toast | Reaches PostgreSQL Inquiry table |
| **Public Tracking** | `https://gurudiamonds.in/track-order` | Form displays with empty inputs; searching invalid order gives clean 404 | Zero customer PII leaked |
| **Dynamic Sitemap** | `https://gurudiamonds.in/sitemap.xml` | Delivers valid XML with `<urlset>`, not React HTML | Valid XML header & URLs |
| **Robots.txt** | `https://gurudiamonds.in/robots.txt` | Returns `User-agent: *`, disallows `/admin` | HTTP 200 text/plain |
| **CMS Footer** | `https://gurudiamonds.in/` (Footer) | Phone `+91 99887 76655`, brand address, social links | Matches database `CMSContent` |

---

## 4. Rollback Plan

### Level 1: Frontend Rollback (Vercel)
- **Trigger:** Visual regressions, client-side routing errors, or asset 404s.
- **Action:** Open Vercel Project Dashboard -> Deployments -> Find previous deployment -> Click **"Instant Rollback"**.
- **Mean Time to Recover (MTTR):** < 30 seconds.
- **Data Impact:** None.

### Level 2: Backend Rollback (Render)
- **Trigger:** Unhandled 500 errors, failed webhook validation, or API crashes.
- **Action:** In Render Dashboard, rollback to previous successful deploy image.
- **MTTR:** < 2 minutes.
- **Data Impact:** None (database remains backward-compatible).

### Level 3: Database Schema Rollback
- **Trigger:** Migration syntax corruption or urgent schema retreat.
- **Action:**
  ```sql
  DROP TABLE IF EXISTS "Inquiry";
  DROP TYPE IF EXISTS "InquiryStatus";
  DELETE FROM "_prisma_migrations" WHERE migration_name = '20260815000000_inquiry_system';
  ```
- **Forward-Recovery Alternative (Preferred):** Because the `Inquiry` table is completely isolated and causes zero side effects, leaving the table idle while troubleshooting the application code is preferred over destructive rollbacks.
