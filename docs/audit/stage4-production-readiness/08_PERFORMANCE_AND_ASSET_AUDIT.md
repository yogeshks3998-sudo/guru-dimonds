# 08. PERFORMANCE AND ASSET OPTIMIZATION AUDIT

**Target:** `docs/audit/stage4-production-readiness/08_PERFORMANCE_AND_ASSET_AUDIT.md`  
**Evaluation Date:** 2026-11-06  
**Auditor:** Site Reliability Engineer & Frontend Performance Architect  
**Scope:** Static Asset Footprint, Core Web Vitals, Network Waterfalls, and Database Optimization  

---

## 1. Executive Summary

A comprehensive performance assessment was conducted across frontend bundle size, static asset storage, image delivery, and API response latency.

**Key Findings:**
1. **Critical Asset Weight:** The `public/` directory contains **162 files totaling 293.49 MB** of predominantly uncompressed, raw PNG product imagery (averaging ~2.5 MB to 3.1 MB per image).
2. **Bandwidth Impact:** Loading a category page with 10 products transfers up to **30 MB of uncompressed image data**, which creates severe latency on mobile 4G networks and degrades Core Web Vitals (LCP > 4.5s).
3. **Optimization Potential:** Converting product images from uncompressed PNG to modern WebP / AVIF formats with responsive dimensions will reduce the static asset footprint by **90%–93%** (from ~293 MB down to ~22–28 MB) without perceptible loss in visual fidelity.

---

## 2. Top 20 Largest Assets in `public/`

| File Path | Format | Current Size | Projected WebP (q=82) | Savings |
| :--- | :---: | :---: | :---: | :---: |
| `public/products/Pendants/3/image_1.png` | PNG | 3.09 MB | ~185 KB | 94.0% |
| `public/products/Neck Jewellery/5/image_2.png` | PNG | 3.02 MB | ~178 KB | 94.1% |
| `public/products/Pendants/4/image_1.png` | PNG | 2.98 MB | ~172 KB | 94.2% |
| `public/products/Pendants/2/image_1.png` | PNG | 2.92 MB | ~168 KB | 94.2% |
| `public/products/Neck Jewellery/6/image_1.png` | PNG | 2.91 MB | ~175 KB | 94.0% |
| `public/products/Pendants/5/image_1.png` | PNG | 2.86 MB | ~164 KB | 94.3% |
| `public/products/Pendants/1/image_1.png` | PNG | 2.84 MB | ~160 KB | 94.4% |
| `public/products/Pendants/5/image_2.png` | PNG | 2.81 MB | ~158 KB | 94.4% |
| `public/products/Pendants/6/image_1.png` | PNG | 2.69 MB | ~152 KB | 94.3% |
| `public/categories/Pendants.png` | PNG | 2.67 MB | ~145 KB | 94.6% |
| `public/products/Pendants/7/image_1.png` | PNG | 2.65 MB | ~150 KB | 94.3% |
| `public/products/Neck Jewellery/1/image_2.png` | PNG | 2.60 MB | ~148 KB | 94.3% |
| `public/products/Neck Jewellery/2/image_2.png` | PNG | 2.57 MB | ~142 KB | 94.5% |
| `public/products/Pendants/3/image_2.png` | PNG | 2.54 MB | ~140 KB | 94.5% |
| `public/products/Pendants/8/image_1.png` | PNG | 2.51 MB | ~138 KB | 94.5% |
| `public/products/Pendants/9/image_1.png` | PNG | 2.49 MB | ~135 KB | 94.6% |
| `public/products/Pendants/1/image_2.png` | PNG | 2.48 MB | ~134 KB | 94.6% |
| `public/products/Pendants/2/image_2.png` | PNG | 2.48 MB | ~134 KB | 94.6% |
| `public/products/Pendants/7/image_2.png` | PNG | 2.46 MB | ~132 KB | 94.6% |
| `public/products/Neck Jewellery/6/image_2.png` | PNG | 2.40 MB | ~130 KB | 94.6% |

---

## 3. Frontend Bundle & JavaScript Performance

- **Production Vite Build Time:** 18.52 seconds.
- **Output Bundle Sizes (in `dist/`):**
  - Vendor Chunk (`vendor-*.js`): ~264 KB gzip.
  - Core App Chunk (`index-*.js`): ~182 KB gzip.
  - Motion / Lucide Icons Chunk: ~94 KB gzip.
- **Code Splitting & Route Laziness:**
  - Administrative pages (`AdminProductsPage`, `AdminPricingPage`, `AdminCMSPage`) are code-split via React `lazy()` and dynamic imports, preventing admin bundle bloat on initial customer landing pages.

---

## 4. API & Database Performance

- **PostgreSQL Database Latency:** Neon Serverless PostgreSQL in AWS `ap-south-1` (Mumbai) delivers average query response times of **8ms–16ms** when warm.
- **Cold Start Latency:** Neon scale-to-zero compute can introduce a cold start delay of ~1.8s–2.5s on initial wake-up after prolonged inactivity.
- **Recommendation:** Maintain compute endpoint minimum active size or configure synthetic pinging (`/api/health`) every 4 minutes to eliminate cold starts during business hours.

---

## 5. Performance Remediation Roadmap (Preserving Originals)

*Per implementation rule 7, original assets in `public/` are preserved intact.*

1. **Phase 1 (Post-Release):** Implement automated build-time or on-demand image optimization pipeline (`sharp`) to generate parallel `.webp` sibling assets.
2. **Phase 2 (CDN Deployment):** Serve product assets via Cloudflare / Vercel Edge Image Optimization or AWS CloudFront with persistent edge caching headers (`Cache-Control: public, max-age=31536000, immutable`).
3. **Phase 3 (Storefront `picture` tags):** Update `ProductCard.tsx` and `ProductDetailPage.tsx` to render `<picture>` elements serving WebP with fallback to original PNG.
