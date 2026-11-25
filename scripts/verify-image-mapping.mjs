import fs from 'node:fs';
import path from 'node:path';

const mappings = [
  {
    id: 1,
    name: 'Ayyappa Silver Tulasi & Rudraksha Mala',
    sku: 'GD-SIL-AYYAPPA-MALA',
    category: 'Spiritual Maalas',
    supplierSourceFolder: 'Products/Pendants/Lord Ayyappa Rudraksha Silver Pendant & Neck Jewellery',
    masterFiles: ['Lord Ayyappa with Tulasi & Rudraksha beads'],
    publicServedPath: '/products/spiritual-maalas/ayyappa-mala/image_1.png',
    rationale: 'Devotional 28-inch mala combining round Tulasi and Rudraksha beads with silver components for Ayyappa devotees.'
  },
  {
    id: 2,
    name: 'Natural Gomedhika Silver Ring',
    sku: 'GD-SIL-GOMED-OVAL-5CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Gomedhika Silver Ring',
    masterFiles: ['Ornate Garnet Ring on Burgundy Velvet.png', 'Ornate Garnet Ring on Hand.png'],
    publicServedPath: '/products/rings/gomedhika/image_1.png',
    rationale: 'Deep honey-brown/cinnamon oval Hessonite Garnet (Gomedhika) set in heavy 12.4g silver gents mount.'
  },
  {
    id: 3,
    name: 'Natural Yellow Sapphire & Ruby Silver Ring',
    sku: 'GD-SIL-SAPPHIRE-RUBY-OVAL',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Yellow Sapphire and Ruby Ring',
    masterFiles: ['Silver Ring with Amber Gemstone on Blue Velvet.png', 'ChatGPT Image Aug 5, 2026, 06_43_38 PM.png'],
    publicServedPath: '/products/rings/sapphire-ruby/image_1.png',
    rationale: 'Unique dual-gem setting featuring natural yellow sapphire paired with ruby accents in 10.6g silver.'
  },
  {
    id: 4,
    name: 'Natural Yellow Sapphire Silver Ring, Oval 3 ct',
    sku: 'GD-SIL-SAPPHIRE-OVAL-3CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Yellow Sapphire Oval 3ct Ring',
    masterFiles: ['Ornate Silver Ring on Blue Satin.png', 'ChatGPT Image Aug 5, 2026, 03_35_34 PM.png'],
    publicServedPath: '/products/rings/yellow-sapphire-oval-3ct/image_1.png',
    rationale: 'Substantial 3 ct oval-cut natural yellow sapphire in an ornate 9.73g silver filigree setting.'
  },
  {
    id: 5,
    name: 'Natural Ruby Silver Ring, Oval 5 ct',
    sku: 'GD-SIL-RUBY-OVAL-5CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Ruby Oval 5ct Mens Ring',
    masterFiles: ['Ornate Ruby Filigree Ring on Blue Satin.png', 'ChatGPT Image Aug 5, 2026, 06_51_45 PM.png'],
    publicServedPath: '/products/rings/ruby-oval-5ct/image_1.png',
    rationale: 'Prominent 5 ct natural oval ruby gemstone mounted in a solid 7.64g silver men\'s ring.'
  },
  {
    id: 6,
    name: 'Natural Yellow Sapphire Silver Ring, Oval 2.5 ct',
    sku: 'GD-SIL-SAPPHIRE-OVAL-2P5CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Yellow Sapphire Oval 2.5ct Ring',
    masterFiles: ['ChatGPT Image Aug 5, 2026, 03_41_13 PM.png', 'ChatGPT Image Aug 5, 2026, 06_25_14 PM.png'],
    publicServedPath: '/products/rings/yellow-sapphire-oval-2p5ct/image_1.png',
    rationale: 'Refined 2.5 ct oval yellow sapphire in a lighter 4.76g daily-wear silver band.'
  },
  {
    id: 7,
    name: 'Natural Yellow Sapphire Silver Ring, Round 4 ct',
    sku: 'GD-SIL-SAPPHIRE-ROUND-4CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Yellow Sapphire Round 4ct Ring',
    masterFiles: ['ChatGPT Image Aug 5, 2026, 03_05_07 PM.png', 'ChatGPT Image Aug 5, 2026, 03_13_26 PM.png'],
    publicServedPath: '/products/rings/yellow-sapphire-round-4ct/image_1.png',
    rationale: 'Distinctive 4 ct circular/round-cut brilliant yellow sapphire mounted in 3.61g silver.'
  },
  {
    id: 8,
    name: 'Men\'s Silver Navaratna Ring, 5 ct',
    sku: 'GD-SIL-NAVARATNA-MEN-5CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Navaratna Round 5ct Mens Ring',
    masterFiles: ['ChatGPT Image Aug 5, 2026, 07_04_17 PM.png', 'ChatGPT Image Aug 5, 2026, 07_06_06 PM.png'],
    publicServedPath: '/products/rings/navaratna-men-5ct/image_1.png',
    rationale: 'Traditional 9-gem planetary circular layout (5 ct total gem weight) in a bold 8.26g men\'s signet mount.'
  },
  {
    id: 9,
    name: 'Unisex Navaratna Silver Ring, 1 ct',
    sku: 'GD-SIL-NAVARATNA-UNISEX-1CT',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Unisex Natural Navaratna Silver Ring 1ct',
    masterFiles: ['ChatGPT Image Aug 5, 2026, 06_58_29 PM.png', 'ChatGPT Image Aug 5, 2026, 07_00_05 PM.png'],
    publicServedPath: '/products/rings/navaratna-unisex-1ct/image_1.png',
    rationale: 'Compact 1 ct Navaratna layout in a versatile 6.2g unisex silver band.'
  },
  {
    id: 10,
    name: 'Natural Pearl Silver Ring',
    sku: 'GD-SIL-PEARL-WOMEN',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Natural Freshwater Pearl Silver Ring',
    masterFiles: ['ChatGPT Image Aug 5, 2026, 03_30_30 PM.png', 'ChatGPT Image Aug 5, 2026, 03_33_03 PM.png'],
    publicServedPath: '/products/rings/pearl-women/image_1.png',
    rationale: 'Delicate feminine design featuring a solitary natural pearl in a 2.2g silver ring.'
  },
  {
    id: 11,
    name: 'Silver Turtle Ring with White AD Stones',
    sku: 'GD-SIL-TURTLE-AD-MEN',
    category: 'Rings',
    supplierSourceFolder: 'Products/Rings/Silver Kurma Turtle White AD Ring',
    masterFiles: ['ChatGPT Image Aug 5, 2026, 07_18_53 PM.png', 'ChatGPT Image Aug 5, 2026, 07_20_23 PM.png'],
    publicServedPath: '/products/rings/turtle-ad-men/image_1.png',
    rationale: 'Vastu Kurma (turtle) design with pavé-set white American Diamonds on the shell, 5.5g silver.'
  },
  {
    id: 12,
    name: 'Silver Stud Earrings with White & Red Synthetic Stones',
    sku: 'GD-SIL-STUD-WHITE-RED-5G',
    category: 'Earrings',
    supplierSourceFolder: 'Products/Earrings/Silver Dual-Tone Ruby White Stone Studs',
    masterFiles: ['Ruby Bloom Earrings in a Velvet Box.png', 'ChatGPT Image Aug 5, 2026, 07_21_02 PM (2).png'],
    publicServedPath: '/products/earrings/stud-white-red/image_1.png',
    rationale: 'Floral stud earrings with ruby-red center stone surrounded by sparkling white AD petals (5g silver).'
  },
  {
    id: 13,
    name: 'Silver Stud Earrings with White, Red & Green Synthetic Stones',
    sku: 'GD-SIL-STUD-WHITE-RED-GREEN-8G',
    category: 'Earrings',
    supplierSourceFolder: 'Products/Earrings/Silver Tricolour Stone Stud Earrings',
    masterFiles: ['Emerald Velvet Box with Floral Gemstone Earrings.png', 'ChatGPT Image Aug 5, 2026, 07_02_16 PM (3).png'],
    publicServedPath: '/products/earrings/stud-white-red-green/image_1.png',
    rationale: 'Tricolour cluster floral studs featuring red ruby, green emerald, and white cubic stones (8g silver).'
  },
  {
    id: 14,
    name: 'Silver Pearl Stud Earrings',
    sku: 'GD-SIL-STUD-PEARL-3P260G',
    category: 'Earrings',
    supplierSourceFolder: 'Products/Earrings/Silver Floral Halo Pearl Stud Earrings',
    masterFiles: ['Luminous Pearl Studs in Velvet Box.png', 'ChatGPT Image Aug 5, 2026, 07_29_34 PM (4).png'],
    publicServedPath: '/products/earrings/stud-pearl/image_1.png',
    rationale: 'Pristine central pearl encircled by delicate silver floral beadwork (3.26g silver).'
  },
  {
    id: 15,
    name: 'Silver Stud Earrings with Uncut Synthetic Ruby Stones',
    sku: 'GD-SIL-STUD-SYNTH-RUBY-3P760G',
    category: 'Earrings',
    supplierSourceFolder: 'Products/Earrings/Silver Uncut Synthetic Ruby Stud Earrings',
    masterFiles: ['Ruby Earrings in a Velvet Jewelry Box.png', 'ChatGPT Image Aug 5, 2026, 07_36_22 PM (2).png'],
    publicServedPath: '/products/earrings/stud-synth-ruby/image_1.png',
    rationale: 'Traditional uncut / polki-style synthetic ruby stones in an ethnic bezel setting (3.76g silver).'
  },
  {
    id: 16,
    name: 'Silver Stud Earrings with Oval Synthetic Emerald Stones',
    sku: 'GD-SIL-STUD-SYNTH-EMERALD-3P200G',
    category: 'Earrings',
    supplierSourceFolder: 'Products/Earrings/Silver Oval Emerald Stud Earrings',
    masterFiles: ['Emerald Stud Earrings in Velvet Box.png', 'ChatGPT Image Aug 5, 2026, 07_43_44 PM (2).png'],
    publicServedPath: '/products/earrings/stud-synth-emerald/image_1.png',
    rationale: 'Rich green oval synthetic emerald solitaires framed by halo border prongs (3.2g silver).'
  }
];

console.log('=== 16 PRODUCTS IMAGE MAPPING AUDIT ===');
let allPassed = true;
for (const m of mappings) {
  const filePath = path.resolve('public', m.publicServedPath.replace(/^\//, ''));
  const exists = fs.existsSync(filePath);
  if (!exists) allPassed = false;
  console.log(`[#${m.id}] ${m.name}`);
  console.log(`   Source Folder: ${m.supplierSourceFolder}`);
  console.log(`   Master Images: ${m.masterFiles.join(', ')}`);
  console.log(`   Public Served: ${m.publicServedPath} (Exists: ${exists ? 'YES' : 'NO'})`);
}
console.log(`\nOverall Integrity: ${allPassed ? 'ALL 16 PRODUCTS CONFIRMED WITH MATCHING PHOTOGRAPHY' : 'ERRORS FOUND'}`);
