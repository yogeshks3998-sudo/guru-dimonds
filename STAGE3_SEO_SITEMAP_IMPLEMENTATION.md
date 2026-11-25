# STAGE 3 — DATABASE-DRIVEN SEO SITEMAP IMPLEMENTATION

## 1. Executive Summary
Prior to Stage 3, `scripts/generate-seo.ts` imported `INITIAL_PRODUCTS` directly from `src/data/mockProducts.ts`. New products added to PostgreSQL through the Admin Dashboard were never discovered by search engine bots, while deleted or disabled products remained indefinitely in the sitemap.

In Stage 3, a dual database-driven SEO architecture was deployed:
1. **Dynamic Real-Time Server Endpoints (`backend/src/routes/seo.ts`)** for continuous bot crawl accuracy.
2. **PostgreSQL-Connected Build Script (`scripts/generate-seo.ts`)** for static pre-rendering with graceful offline fallback.

---

## 2. Dynamic Endpoints (`backend/src/routes/seo.ts`)

### `GET /sitemap.xml`
- Queries all currently active products from PostgreSQL: `prisma.product.findMany({ where: { status: 'ACTIVE' } })`.
- Excludes draft, inactive, or archived products.
- Queries all categories from `prisma.category.findMany()`.
- Generates canonical product and category URLs with proper XML entity escaping (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`).
- Emits accurate `<lastmod>` timestamps derived from `product.updatedAt`.
- Serves compliant XML with `Content-Type: application/xml`.

### `GET /image-sitemap.xml`
- Extracts product media URLs from published products.
- Validates image URL format and attaches canonical product titles.

### `GET /robots.txt`
- Explicitly allows storefront routes (`/`, `/shop`, `/product/*`).
- Strictly disallows administrative, payment, and private customer paths:
  ```
  Disallow: /admin
  Disallow: /checkout
  Disallow: /account
  ```
- Links search engines directly to `https://gurudiamonds.in/sitemap.xml` and `https://gurudiamonds.in/image-sitemap.xml`.

---

## 3. Build-Time Generator Script (`scripts/generate-seo.ts`)
- Replaced the mock dependency with PostgreSQL Prisma queries.
- Safely disconnects the Prisma Client upon completion.
- Includes a try/catch wrapper that falls back to static core routes if PostgreSQL is unreachable during offline client-only CI builds, ensuring frontend deployments never fail due to database downtime.
- Verified output:
  ```
  [SEO] Retrieved 56 published products and 17 categories from PostgreSQL.
  [SEO] Generated SEO files for https://gurudiamonds.in (Total URLs: 81)
  ```
