# Deployment

## Local Production Check

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build:prod
npm run api
```

The API runs on `PORT`, default `5000`. The Vite build is emitted to `dist`.

## Render

`render.yaml` provides a starter service configuration. Set these secrets in Render:

```text
DATABASE_URL
JWT_SECRET
APP_URL
VITE_API_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Run migrations before first production traffic:

```bash
npm run db:deploy
```

Seed the production database only when intentionally resetting or initializing content:

```bash
npm run db:seed
npm run db:seed:brand-identity
```

Use production-safe credentials before seeding real environments. The included seed credentials are for local/staging validation only.

For an API-only Render service, use:

```bash
Build Command: npm ci && npm run db:generate && npm run db:deploy && npm run build:api
Start Command: npm run start:api
Health Check Path: /api/health
```

## Vercel

`vercel.json` rewrites direct browser requests such as `/login`, `/admin`, and `/admin/products` to the React single-page app entrypoint. Set this frontend environment variable in Vercel:

```text
VITE_API_URL=https://guru-dimonds.onrender.com/api
```

## SEO

Generate SEO files after build:

```bash
SITE_URL="https://gurudimonds.in" npm run build:seo
```

This writes:

```text
dist/sitemap.xml
dist/image-sitemap.xml
dist/robots.txt
```
