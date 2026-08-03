# Deployment

## Local Production Check

```bash
npm ci
npm run db:generate
npm run db:migrate
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
npm run db:migrate
npm run db:seed
```

Use production-safe credentials before seeding real environments. The included seed credentials are for local/staging validation only.

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
