# STAGE 3 REGRESSION RISK ASSESSMENT & FAILURE MODE ANALYSIS

## Risk Matrix

| Risk Item | Likelihood | Impact | Mitigations Implemented & Verified | Residual Risk |
|---|---|---|---|---|
| **1. Spam Flooding on Contact Form** | Medium | Medium | In-memory sliding window IP rate limiter (5 submissions per 10 min); strict server-side validation on field lengths and email format. | Low |
| **2. Order Number Enumeration / PII Scraping** | Low | Critical | Rate limiter (20 requests per 5 min); zero PII returned; customer ownership check for authenticated sessions; contact parameter verification for guests. | Negligible |
| **3. Offline Database Failure during SEO Build** | Low | High | Try/catch fallback in `scripts/generate-seo.ts` generates static core routes if PostgreSQL connection is absent, preventing broken production builds. | None |
| **4. Storefront Broken Layout on Missing CMS Data** | Low | Medium | `applyCMSFallbacks` provides robust fallbacks for all optional fields, hero banners, and footer contacts. | None |
| **5. Cross-Site Scripting (XSS) via CMS Links** | Low | High | `sanitizeLink` rejects `javascript:`, `data:`, and `vbscript:` pseudo-protocols on banner links, announcement URLs, and social profiles. | None |
| **6. Stale Data Display on API Error** | Low | Low | Storefront updates optimistic changes but automatically rolls back state and emits toast alerts if backend API calls fail. | None |

---

## Detailed Failure Mode Analysis

### Failure Mode A: High Volume Inquiry Bot
- **Scenario:** An automated bot sends rapid-fire POST requests to `/api/inquiries`.
- **Response:** The sliding-window rate limiter counts timestamps per client IP. Once 5 requests occur within 10 minutes, the server immediately rejects subsequent submissions with `HTTP 429 Too Many Requests` (`"Too many inquiry submissions. Please wait a few minutes before trying again."`). The database is shielded from connection exhaustion.

### Failure Mode B: Public Visitor Guessing Order Numbers
- **Scenario:** A visitor attempts to scrape customer details by calling `/api/orders/track/GD-2026-0001`, `GD-2026-0002`, etc.
- **Response:**
  1. The response object **never includes** customer names, phone numbers, email addresses, shipping/billing addresses, payment IDs, or invoice amounts.
  2. If the request is from an unauthenticated user, optional contact verification (`?contact=...`) blocks access if mismatched.
  3. Excessive requests trigger `HTTP 429 Too Many Requests`.

### Failure Mode C: Database Outage during Frontend Static Build
- **Scenario:** CI/CD triggers `npm run build:seo` when PostgreSQL pooler is undergoing maintenance or network connectivity is interrupted.
- **Response:** `scripts/generate-seo.ts` catches the connection error, logs a warning (`[SEO] Database unavailable during SEO build, falling back to static routes`), writes canonical static URLs, and exits cleanly with code 0. Production deployment is not blocked.
