# PRODUCTION DEPLOYMENT RUNBOOK (EXECUTIVE GUIDE)

**Target:** `docs/audit/stage4-production-readiness/DEPLOYMENT_RUNBOOK.md`  

---

## 1. Quick Reference

| Component | Host / Provider | Target URL / Identifier | Build Command | Start Command |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | Neon PostgreSQL 16 | AWS ap-south-1 (Mumbai) | `npx prisma migrate deploy` | Managed Serverless |
| **Backend API** | Render | `https://guru-dimonds.onrender.com` | `npm ci && npm run db:generate && npm run db:deploy && npm run build:api` | `npm run start:api` |
| **Frontend** | Vercel | `https://gurudiamonds.in` | `npm run build && npm run build:seo` | Edge CDN Static |

---

## 2. Pre-Deployment Execution Commands

Run locally or in CI before deployment:

```bash
# 1. Typecheck & Build API
npm run lint
npm run build:api

# 2. Build Frontend & SEO Assets
npm run build:seo
npm run build

# 3. Verify Health Check
npm run dev:api &
curl http://localhost:5000/api/health
```

---

## 3. Production Deployment Execution Order

### Phase 1: Database Migration
In the Render build script (or manual deployment runner connected to the production database):
```bash
npx prisma migrate deploy
```
*Note: This applies `20260815000000_inquiry_system`, creating the Inquiry table. Existing tables undergo 0 locks.*

### Phase 2: Render Backend Web Service
1. Navigate to Render Dashboard -> `guru-diamonds`.
2. Verify environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: `postgresql://...`
   - `JWT_SECRET`: High-entropy string
   - `RAZORPAY_KEY_ID`: `rzp_live_...`
   - `RAZORPAY_KEY_SECRET`: Live Secret
   - `RAZORPAY_WEBHOOK_SECRET`: Live Webhook Secret
3. Trigger **Manual Deploy** -> **Deploy latest commit**.
4. Confirm healthcheck at `https://guru-dimonds.onrender.com/api/health` returns HTTP 200.

### Phase 3: Vercel Frontend Deployment
1. Navigate to Vercel Dashboard -> Project `guru-diamonds`.
2. Verify environment variable:
   - `VITE_API_URL`: `https://guru-dimonds.onrender.com/api`
3. Trigger deployment from the release commit.
4. Verify root URL `https://gurudiamonds.in` loads with HTTP 200.

---

## 4. Post-Deployment Verification (Smoke Tests)

```bash
# Verify API Health
curl -I https://guru-dimonds.onrender.com/api/health

# Verify Dynamic Sitemap returns XML, not HTML
curl -s https://gurudiamonds.in/sitemap.xml | head -n 5

# Verify Robots.txt
curl -s https://gurudiamonds.in/robots.txt

# Verify Categories API
curl -s https://guru-dimonds.onrender.com/api/categories | head -c 100
```
