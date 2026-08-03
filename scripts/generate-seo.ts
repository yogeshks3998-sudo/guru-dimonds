import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';

const siteUrl = (process.env.SITE_URL || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const publicDir = path.resolve('dist');

const routes = [
  '/',
  '/shop',
  '/about',
  '/contact',
  '/size-guide',
  '/privacy-policy',
  '/terms',
  '/wishlist',
  '/track-order',
  ...INITIAL_PRODUCTS.map((product) => `/product/${product.slug}`),
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>
    <changefreq>${route.startsWith('/product/') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/product/') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}\n</urlset>\n`;

const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${INITIAL_PRODUCTS.map(
  (product) => `  <url>
    <loc>${escapeXml(`${siteUrl}/product/${product.slug}`)}</loc>
${product.images
  .slice(0, 3)
  .map(
    (image) => `    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>`
  )
  .join('\n')}
  </url>`
).join('\n')}\n</urlset>\n`;

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

console.log(`Generated SEO files for ${siteUrl}`);

