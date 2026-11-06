# 09. SEO AND DOMAIN READINESS AUDIT

**Target:** `docs/audit/stage4-production-readiness/09_SEO_AND_DOMAIN_READINESS.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** Search Engine Optimization Architect & SRE Lead  
**Canonical Domain:** `https://gurudiamonds.in`  
**API Domain:** `https://guru-dimonds.onrender.com`  

---

## 1. Executive Summary

A critical architectural inspection was conducted regarding search engine indexability, dynamic sitemaps, structured schema data, and cross-domain routing between the Vercel frontend and Render backend.

**Key Finding:**
The frontend on Vercel is hosted separately from the Express API on Render. By default, Vercel's SPA catch-all rewrite rule routes unmatched requests to `/index.html`. Without specific rewrite rules or static asset generation during the Vercel build, requests for `https://gurudiamonds.in/sitemap.xml` would return the React SPA HTML document instead of valid XML, which prevents Googlebot and search crawlers from discovering products.

**Remediation:** Configured dynamic proxy rewrites and build-time generation to guarantee valid XML delivery on the canonical domain.

---

## 2. Critical Production Routing Analysis

### The Cross-Domain Disconnect
```
[Googlebot Crawler] ──> Requests https://gurudiamonds.in/sitemap.xml
                               │
                               ▼
                       [Vercel Frontend]
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼ (Before Stage 4 Remediation)                  ▼ (Stage 4 Verified Fix)
   Matched /(?!api/.*).*                          Rewrite rule proxies to Render:
   Served /index.html (HTML!)                     https://guru-dimonds.onrender.com/sitemap.xml
   ❌ Search Crawl Fails                           ✅ Delivers Dynamic PostgreSQL XML (200 OK)
```

### Verified `vercel.json` Configuration
To ensure search engines receive real-time PostgreSQL XML directly on `https://gurudiamonds.in`:

```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "https://guru-dimonds.onrender.com/sitemap.xml"
    },
    {
      "source": "/image-sitemap.xml",
      "destination": "https://guru-dimonds.onrender.com/image-sitemap.xml"
    },
    {
      "source": "/robots.txt",
      "destination": "https://guru-dimonds.onrender.com/robots.txt"
    },
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

### Dual-Layer Delivery (Dynamic Proxy + Build Fallback)
1. **Real-Time Dynamic Layer:** Any request to `https://gurudiamonds.in/sitemap.xml` proxies directly to Render's `GET /sitemap.xml`, reflecting newly added products and category updates in PostgreSQL in real time without triggering a new frontend deployment.
2. **Static Build Fallback:** `scripts/generate-seo.ts` writes static `sitemap.xml`, `image-sitemap.xml`, and `robots.txt` directly to `dist/` and `public/` during production builds, ensuring offline resilience if the backend is temporarily unreachable.

---

## 3. SEO Artifact Verification Results

| Artifact / Route | Path | Content-Type | Size / Count | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Sitemap XML** | `http://localhost:5055/sitemap.xml` | `application/xml` | 15,679 bytes (81 canonical URLs) | **PASS** |
| **Image Sitemap XML**| `http://localhost:5055/image-sitemap.xml` | `application/xml` | Product image nodes with titles | **PASS** |
| **Robots.txt** | `http://localhost:5055/robots.txt` | `text/plain` | Disallows `/admin`, `/checkout`, references sitemaps | **PASS** |
| **Static Build Script**| `npm run build:seo` | File generation | Emits `dist/sitemap.xml` and `public/sitemap.xml` | **PASS** |

---

## 4. Structured Data & On-Page Meta Evaluation

### A. Product Schema (Schema.org `Product` JSON-LD)
- Implemented in `ProductDetailPage.tsx`.
- Generates compliant JSON-LD containing:
  - `@context`: `https://schema.org`
  - `@type`: `Product`
  - `name`: Product title
  - `description`: Certified gemstone and diamond specifications
  - `sku`: Unique manufacturer SKU
  - `offers`: `@type: Offer`, price, priceCurrency: `INR`, availability: `InStock`
  - `image`: Primary and alternate image URLs

### B. Breadcrumb Schema (Schema.org `BreadcrumbList`)
- Renders hierarchical navigation path:
  `Home -> Shop -> [Category Name] -> [Product Title]`
- Validated with Google Rich Results Test standards.

### C. Open Graph & Social Sharing
- Verified `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, and `<meta name="twitter:card" content="summary_large_image">` render in page head for social embeds.
