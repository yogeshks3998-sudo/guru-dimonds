import fs from 'fs';
import path from 'path';
import { prisma } from '../backend/src/config/db';

const siteUrl = (process.env.SITE_URL || process.env.APP_URL || 'https://gurudiamonds.in').replace(/\/$/, '');
const publicDir = path.resolve('dist');

const escapeXml = (value: string) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function generateSEO() {
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

  let publishedProducts: Array<{ name: string; slug: string; updatedAt: Date; images: any }> = [];
  let categories: Array<{ name: string; slug: string; updatedAt: Date }> = [];

  try {
    publishedProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { name: true, slug: true, updatedAt: true, images: true },
    });
    categories = await prisma.category.findMany({
      select: { name: true, slug: true, updatedAt: true },
    });
    console.log(`[SEO] Retrieved ${publishedProducts.length} published products and ${categories.length} categories from PostgreSQL.`);
  } catch (error) {
    console.warn('[SEO] Database unavailable during SEO build, falling back to static routes:', error);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  const categoryEntries = categories.map((cat) => ({
    loc: `${siteUrl}/shop?category=${encodeURIComponent(cat.slug || cat.name)}`,
    lastmod: cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : undefined,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const productEntries = publishedProducts.map((prod) => ({
    loc: `${siteUrl}/product/${encodeURIComponent(prod.slug)}`,
    lastmod: prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : undefined,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  const allUrls = [...staticRoutes, ...categoryEntries, ...productEntries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
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
</urlset>\n`;

  const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${publishedProducts
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
</urlset>\n`;

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /account

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/image-sitemap.xml
`;

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(publicDir, 'image-sitemap.xml'), imageSitemap);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);

  console.log(`[SEO] Generated SEO files for ${siteUrl} (Total URLs: ${allUrls.length})`);
}

generateSEO().catch((err) => {
  console.error('[SEO] Failed to generate SEO files:', err);
});
