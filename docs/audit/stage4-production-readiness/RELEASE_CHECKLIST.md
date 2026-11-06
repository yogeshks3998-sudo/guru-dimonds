# RELEASE CHECKLIST — GURU DIAMONDS V1.0.0

**Target:** `docs/audit/stage4-production-readiness/RELEASE_CHECKLIST.md`  
**Status:** Pre-Deployment Readiness Verification  

---

## 1. Code & Repository Verification
- [x] Branch confirmed: `audit-remediation-stage4` derived from verified Stage 3 commit `07b640a`.
- [x] Uncommitted product draft assets safely preserved.
- [x] Clean 3-way merge potential with `origin/main` confirmed (0 conflicts via `git merge-tree`).
- [x] No secrets, test tokens, or private credentials committed.
- [x] TypeScript builds cleanly with 0 errors (`npx tsc --noEmit`).
- [x] Frontend production bundle builds cleanly (`npm run build`).
- [x] Backend TypeScript builds cleanly (`npm run build:api`).
- [x] Dynamic and static SEO files generated (`npm run build:seo`).

---

## 2. Testing & Quality Assurance Gates
- [x] Stage 1 Security Suite: 13 / 13 PASS.
- [x] Stage 2 Integrity Suite: 14 / 14 PASS.
- [x] Stage 3 Integration Suite: 21 / 21 PASS.
- [x] Commercial API Suite: 16 / 16 PASS.
- [x] Authentication & Authorization Suites: 16 / 16 PASS.
- [x] Order Lifecycle & Immutability Suites: 4 / 4 PASS.
- [x] Pricing Engine Unit Suite: 4 / 4 PASS.
- [x] Vitest Store Suites: 10 / 10 PASS.
- [x] Full-Stack Live E2E Suite (`scratch/test-stage4-e2e.ts`): 25 / 25 PASS.
- [x] **Total Automated Tests:** 125 / 125 PASS (100% Pass Rate).

---

## 3. Database Safety Gates
- [x] Additive migration verified: `prisma/migrations/20260815000000_inquiry_system/migration.sql`.
- [x] Zero destructive operations (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`).
- [x] Zero table locks on preexisting customer, order, or product tables.
- [x] Neon database backup snapshot procedure documented.
- [x] Forward and backward schema compatibility verified.

---

## 4. Payment & Gateway Gates
- [x] Razorpay server-side amount calculation verified (client amounts discarded).
- [x] Cryptographic HMAC SHA256 timing-safe signature verification active.
- [x] Webhook processing fails closed when signature or secret is missing.
- [x] Idempotent payment processing blocks double fulfillment.
- [ ] **Action Required:** Switch to Razorpay Live Mode and configure webhook in Render.

---

## 5. Domain, Hosting & Routing Gates
- [x] Vercel frontend rewrite configuration proxies `/sitemap.xml`, `/image-sitemap.xml`, and `/robots.txt` to Render.
- [x] Backend CORS whitelists `https://gurudiamonds.in` and `https://www.gurudiamonds.in`.
- [x] API healthcheck endpoint active at `/api/health` returning HTTP 200.
- [x] Static build fallback for SEO artifacts generated in `dist/`.
