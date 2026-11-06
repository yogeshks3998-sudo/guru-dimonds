# 10. SECURITY AND RELIABILITY AUDIT

**Target:** `docs/audit/stage4-production-readiness/10_SECURITY_AND_RELIABILITY_AUDIT.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** Cybersecurity Auditor & Site Reliability Engineer  
**Scope:** Vulnerability Assessment, Threat Modeling, Proxy IP Integrity, and Rate-Limiter Architecture  

---

## 1. Executive Summary

A comprehensive security and reliability audit was conducted across the Guru Diamonds platform to evaluate authentication robustness, data privacy, injection vectors, and DDoS resilience.

**Overall Security Status:** **STRONG (No High or Critical Remote Vulnerabilities Identified)**

---

## 2. Threat Modeling & Controls Verification

| Security Domain | Evaluated Mechanism | Findings & Protections | Verification Status |
| :--- | :--- | :--- | :---: |
| **Authentication & Session** | JWT with HS256 HMAC | Auth tokens signed with `JWT_SECRET`. Tokens include `sub`, `email`, and `type`/`role`. Validated in `auth.ts` middleware. | **VERIFIED** |
| **Role-Based Access Control** | `requireRole(...)` middleware | Hierarchy strictly enforced: `SUPER_ADMIN` > `OWNER` > `ORDER_MANAGER` > `CONTENT_MANAGER` > `STAFF`. `STAFF` blocked from customer lists. | **VERIFIED** |
| **Customer Data Isolation** | Scoped queries (`req.auth.sub`)| Order history and address queries strictly filter by authenticated customer ID. Horizontal privilege escalation blocked. | **VERIFIED** |
| **Cross-Site Scripting (XSS)** | `sanitizeLink` + React JSX | Social links and CMS URLs sanitized against `javascript:` and data URIs. Storefront JSX automatically escapes rendered strings. | **VERIFIED** |
| **Payment Integrity** | HMAC SHA256 timing-safe check | Signature validation enforces length matching and `crypto.timingSafeEqual`. Tampered signatures fail closed. | **VERIFIED** |
| **SQL Injection** | Prisma ORM parameterization | All database queries utilize Prisma parameterized queries and type-safe query builders. No raw SQL concatenations exist. | **VERIFIED** |
| **CORS Policy** | Origin whitelisting in Express | `cors` middleware explicitly validates origin against configured list (`APP_URL`, `gurudiamonds.in`, localhost). Rejects unauthorized origins. | **VERIFIED** |
| **Sensitive Data Exposure** | Public Tracking Sanitizer | `GET /api/orders/track/:reference` scrubs customer names, phone numbers, delivery addresses, payment tokens, and totals. | **VERIFIED** |

---

## 3. Rate-Limiting Architecture & Reverse Proxy IP Evaluation

### A. Current Implementation: In-Memory Sliding Window
In `backend/src/routes/inquiries.ts` and `backend/src/routes/orders.ts`:
```ts
const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
checkRateLimit(clientIp);
```

### B. Audit Findings:
1. **Multi-Instance Limitation:** Because `submissionTracker` uses an in-memory `Map<string, number[]>`, rate limits are local to each Node.js process. If Render scales horizontally across 2 or more instances, an attacker could rotate requests across instances, doubling the effective limit.
2. **Server Restart Reset:** Re-deploying or restarting the backend process flushes the in-memory map.
3. **Proxy IP Trust (`req.ip` behind Render):**
   - Express default without `app.set('trust proxy', ...)` does not parse the `X-Forwarded-For` header.
   - Behind Render's reverse proxy, `req.ip` reflects the proxy's internal private IP.
   - **Risk:** If all users appear to come from the proxy IP, multiple customers could inadvertently share the same rate-limit bucket.

### C. Recommended Hardening Actions (P2 Improvement):
1. **Set Single-Hop Trust Proxy in `backend/src/app.ts`:**
   ```ts
   app.set('trust proxy', 1); // Trust first hop reverse proxy (Render / Cloudflare)
   ```
2. **Durable Distributed Rate Limiting (for Multi-Instance Scale):**
   For horizontal scaling beyond 1 container, transition from the in-memory `Map` to an external Redis or Upstash rate limiter (`@upstash/ratelimit`). For the current single-container Starter plan, in-memory rate limiting with `trust proxy: 1` provides sufficient protection.

---

## 4. Secret Exposure Prevention

A project-wide automated regex search was conducted across all files committed to the repository for credentials, private keys, and plaintext secrets:
- No hardcoded Razorpay live secrets found in Git tracking.
- No database connection passwords committed.
- `.env` is properly excluded via `.gitignore`.
