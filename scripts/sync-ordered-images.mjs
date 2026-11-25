import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function md5(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

// 1. Fix 2 (2).png typo if exists
const fixPath = path.resolve('Products/Earrings/Silver Dual-Tone Ruby White Stone Studs/2 (2).png');
const fixDest = path.resolve('Products/Earrings/Silver Dual-Tone Ruby White Stone Studs/2.png');
if (fs.existsSync(fixPath)) {
  fs.renameSync(fixPath, fixDest);
  console.log('Renamed 2 (2).png to 2.png in Silver Dual-Tone Ruby White Stone Studs');
}

const sources = [
  { id: 'prod-supplier-silver-20261117-01', src: 'Products/Pendants/Lord Ayyappa Rudraksha Silver Pendant', dest: 'public/products/spiritual-maalas/ayyappa-mala', urlBase: '/products/spiritual-maalas/ayyappa-mala', price: 8500 },
  { id: 'prod-supplier-silver-20261117-02', src: 'Products/Rings/Auspicious Gomedha Hessonite Silver Ring', dest: 'public/products/Rings/gomedhika', urlBase: '/products/Rings/gomedhika', price: 5230 },
  { id: 'prod-supplier-silver-20261117-03', src: 'Products/Rings/Mens Yellow Sapphire and Ruby Dual Ring', dest: 'public/products/Rings/sapphire-ruby', urlBase: '/products/Rings/sapphire-ruby', price: 7290 },
  { id: 'prod-supplier-silver-20261117-04', src: 'Products/Rings/Natural Yellow Sapphire Classic Ring', dest: 'public/products/Rings/yellow-sapphire-oval-3ct', urlBase: '/products/Rings/yellow-sapphire-oval-3ct', price: 5266 },
  { id: 'prod-supplier-silver-20261117-05', src: 'Products/Rings/Natural Ruby Oval 5ct Mens Ring', dest: 'public/products/Rings/ruby-oval-5ct', urlBase: '/products/Rings/ruby-oval-5ct', price: 6528 },
  { id: 'prod-supplier-silver-20261117-06', src: 'Products/Rings/Natural Yellow Sapphire Oval 2.5ct Ring', dest: 'public/products/Rings/yellow-sapphire-oval-2p5ct', urlBase: '/products/Rings/yellow-sapphire-oval-2p5ct', price: 5677 },
  { id: 'prod-supplier-silver-20261117-07', src: 'Products/Rings/Natural Yellow Sapphire Round 4ct Ring', dest: 'public/products/Rings/yellow-sapphire-round-4ct', urlBase: '/products/Rings/yellow-sapphire-round-4ct', price: 6382 },
  { id: 'prod-supplier-silver-20261117-08', src: 'Products/Rings/Natural Navaratna Round 5ct Mens Ring', dest: 'public/products/Rings/navaratna-men-5ct', urlBase: '/products/Rings/navaratna-men-5ct', price: 6852 },
  { id: 'prod-supplier-silver-20261117-09', src: 'Products/Rings/Natural Navaratna Square Silver Ring', dest: 'public/products/Rings/navaratna-unisex-1ct', urlBase: '/products/Rings/navaratna-unisex-1ct', price: 3320 },
  { id: 'prod-supplier-silver-20261117-10', src: 'Products/Rings/Natural Freshwater Pearl Silver Ring', dest: 'public/products/Rings/pearl-women', urlBase: '/products/Rings/pearl-women', price: 2064 },
  { id: 'prod-supplier-turtle-studs-20261117-01', src: 'Products/Rings/Petite Silver Turtle Micro AD Ring', dest: 'public/products/Rings/turtle-ad-men', urlBase: '/products/Rings/turtle-ad-men', price: 1574 },
  { id: 'prod-supplier-turtle-studs-20261117-02', src: 'Products/Earrings/Silver Dual-Tone Ruby White Stone Studs', dest: 'public/products/Earrings/stud-white-red', urlBase: '/products/Earrings/stud-white-red', price: 2044 },
  { id: 'prod-supplier-turtle-studs-20261117-03', src: 'Products/Earrings/Silver Tricolour Stone Stud Earrings', dest: 'public/products/Earrings/stud-white-red-green', urlBase: '/products/Earrings/stud-white-red-green', price: 3600 },
  { id: 'prod-supplier-turtle-studs-20261117-04', src: 'Products/Earrings/Silver Floral Halo Pearl Stud Earrings', dest: 'public/products/Earrings/stud-pearl', urlBase: '/products/Earrings/stud-pearl', price: 1702 },
  { id: 'prod-supplier-turtle-studs-20261117-05', src: 'Products/Earrings/Silver Uncut Synthetic Ruby Stud Earrings', dest: 'public/products/Earrings/stud-synth-ruby', urlBase: '/products/Earrings/stud-synth-ruby', price: 1904 },
  { id: 'prod-supplier-turtle-studs-20261117-06', src: 'Products/Earrings/Silver Oval Emerald Stud Earrings', dest: 'public/products/Earrings/stud-synth-emerald', urlBase: '/products/Earrings/stud-synth-emerald', price: 1764 }
];

const newMediaMap = {};

for (const s of sources) {
  const srcPath = path.resolve(s.src);
  const destPath = path.resolve(s.dest);
  fs.mkdirSync(destPath, { recursive: true });

  const copiedUrls = [];

  // 1. Copy 1.png -> image_1.png
  const src1 = path.join(srcPath, '1.png');
  const dest1 = path.join(destPath, 'image_1.png');
  if (fs.existsSync(src1)) {
    fs.copyFileSync(src1, dest1);
    copiedUrls.push(`${s.urlBase}/image_1.png`);
    console.log(`[${s.id}] Copied 1.png -> image_1.png (hash: ${md5(dest1)})`);
  }

  // 2. Copy 2.png -> image_2.png
  const src2 = path.join(srcPath, '2.png');
  const dest2 = path.join(destPath, 'image_2.png');
  if (fs.existsSync(src2)) {
    fs.copyFileSync(src2, dest2);
    copiedUrls.push(`${s.urlBase}/image_2.png`);
    console.log(`[${s.id}] Copied 2.png -> image_2.png (hash: ${md5(dest2)})`);
  }

  // 3. Copy 3.png -> image_3.png (if exists)
  const src3 = path.join(srcPath, '3.png');
  const dest3 = path.join(destPath, 'image_3.png');
  if (fs.existsSync(src3)) {
    fs.copyFileSync(src3, dest3);
    copiedUrls.push(`${s.urlBase}/image_3.png`);
    console.log(`[${s.id}] Copied 3.png -> image_3.png (hash: ${md5(dest3)})`);
  }

  newMediaMap[s.id] = {
    images: copiedUrls,
    price: s.price,
  };
}

// Generate updated src/data/productMediaMap.ts
const code = `export interface ProductMediaConfig {
  images: string[];
  price: number;
}

export const PRODUCT_MEDIA_MAP: Record<string, ProductMediaConfig> = ${JSON.stringify(newMediaMap, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/productMediaMap.ts'), code, 'utf8');
console.log('\nSuccessfully synced ordered images and updated src/data/productMediaMap.ts!');
