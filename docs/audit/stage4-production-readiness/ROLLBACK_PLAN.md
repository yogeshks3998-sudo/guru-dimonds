# PRODUCTION ROLLBACK PLAN

**Target:** `docs/audit/stage4-production-readiness/ROLLBACK_PLAN.md`  

---

## 1. Overview & Strategy

The deployment of Guru Diamonds Stage 4 is architected with strict backward compatibility across database, backend, and frontend tiers. In the event of a deployment failure or unexpected production issue, rollback can be achieved without data loss or service disruption.

---

## 2. Tiered Rollback Matrix

| Tier | Failure Symptom | Rollback Method | Estimated Recovery Time | Data Loss Risk |
| :--- | :--- | :--- | :---: | :---: |
| **Tier 1: Frontend (Vercel)** | Blank page, JS console error, routing loop, broken layout | Instant Rollback in Vercel UI to prior deployment hash | < 30 seconds | None |
| **Tier 2: Backend (Render)** | API 500 errors, crash loops, unhandled rejections | Redeploy previous successful image in Render Dashboard | < 2 minutes | None |
| **Tier 3: Database** | Migration execution error | SQL Table Drop or Leave-in-Place Forward Recovery | < 1 minute | None |
| **Tier 4: Payment Gateway** | Webhook signature failures, order creation rejection | Revert to previous webhook secret / key in Render env | < 1 minute | None |

---

## 3. Step-by-Step Rollback Procedures

### Procedure A: Frontend Instant Rollback (Vercel)
1. Open [Vercel Dashboard](https://vercel.com/dashboard).
2. Select `guru-diamonds` project -> **Deployments**.
3. Locate the previous working production deployment (tagged `main` prior to release).
4. Click the three dots `...` -> **Promote to Production / Instant Rollback**.
5. Verification: Visit `https://gurudiamonds.in` in an incognito window to verify restoration.

### Procedure B: Backend API Rollback (Render)
1. Open [Render Dashboard](https://dashboard.render.com/).
2. Select web service `guru-diamonds`.
3. Under **Events**, locate the previous successful deploy.
4. Click **Rollback to this deploy**.
5. Verification: Execute `curl -I https://guru-dimonds.onrender.com/api/health`.

### Procedure C: Database Rollback (PostgreSQL)
Because migration `20260815000000_inquiry_system` is purely additive, existing tables (`Order`, `Customer`, `Product`) have no foreign keys referencing `Inquiry`.

**Option 1 (Recommended): Leave-in-Place Forward Recovery**
Do not drop the table. The table is completely harmless and does not affect previous versions of the application.

**Option 2 (Full Schema Reversion):**
If the table must be explicitly removed:
```sql
DROP TABLE IF EXISTS "Inquiry";
DROP TYPE IF EXISTS "InquiryStatus";
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260815000000_inquiry_system';
```
