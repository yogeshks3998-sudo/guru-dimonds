import { Router } from 'express';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { asyncHandler } from '../utils/http';
import { isDemoProduct } from '../../../src/utils/supplierProducts';

export const seoRouter = Router();

const escapeXml = (value: string) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

seoRouter.get(
  '/sitemap.xml',
  asyncHandler(async (_req, res) => {
    const siteUrl = env.appUrl.replace(/\/$/, '');

    // 1. Static Core Routes
    const staticRoutes = [
      { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${siteUrl}/shop`, changefreq: 'daily', priority: '0.9' },
      { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${siteUrl}/size-guide`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${siteUrl}/privacy-policy`, changefreq: 'monthly', priority: '0.4' },
      { loc: `${siteUrl}/terms`, changefreq: 'monthly', priority: '0.4' },
      { loc: `${siteUrl}/track-order`, changefreq: 'weekly', priority: '0.6' },
    ];

    // 2. Query only ACTIVE published non-demo products from PostgreSQL
    const rawProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });
    const products = rawProducts.filter((p) => !isDemoProduct(p.slug));

    // 3. Query Categories
    const categories = await prisma.category.findMany({
      select: { slug: true, name: true, updatedAt: true },
    });

    const categoryEntries = categories.map((cat) => ({
      loc: `${siteUrl}/shop?category=${encodeURIComponent(cat.slug || cat.name)}`,
      lastmod: cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : undefined,
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const productEntries = products.map((prod) => ({
      loc: `${siteUrl}/product/${encodeURIComponent(prod.slug)}`,
      lastmod: prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : undefined,
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const allUrls = [...staticRoutes, ...categoryEntries, ...productEntries];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  })
);

seoRouter.get(
  '/image-sitemap.xml',
  asyncHandler(async (_req, res) => {
    const siteUrl = env.appUrl.replace(/\/$/, '');
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { name: true, slug: true, images: true },
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products
  .map((p) => {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    if (images.length === 0) return '';
    return `  <url>
    <loc>${escapeXml(`${siteUrl}/product/${encodeURIComponent(p.slug)}`)}</loc>
${images
  .slice(0, 5)
  .map(
    (img) => `    <image:image>
      <image:loc>${escapeXml(img.startsWith('http') ? img : `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`)}</image:loc>
      <image:title>${escapeXml(p.name)}</image:title>
    </image:image>`
  )
  .join('\n')}
  </url>`;
  })
  .filter(Boolean)
  .join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  })
);

seoRouter.get('/robots.txt', (_req, res) => {
  const siteUrl = env.appUrl.replace(/\/$/, '');
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /account

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/image-sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

