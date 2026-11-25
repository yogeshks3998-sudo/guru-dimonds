import fs from 'node:fs';
import path from 'node:path';

const usedFolders = new Set([
  'Products/Pendants/Lord Ayyappa Rudraksha Silver Pendant',
  'Products/Rings/Auspicious Gomedha Hessonite Silver Ring',
  'Products/Rings/Mens Yellow Sapphire and Ruby Dual Ring',
  'Products/Rings/Natural Yellow Sapphire Classic Ring',
  'Products/Rings/Natural Ruby Oval 5ct Mens Ring',
  'Products/Rings/Natural Yellow Sapphire Oval 2.5ct Ring',
  'Products/Rings/Natural Yellow Sapphire Round 4ct Ring',
  'Products/Rings/Natural Navaratna Round 5ct Mens Ring',
  'Products/Rings/Natural Navaratna Square Silver Ring',
  'Products/Rings/Natural Freshwater Pearl Silver Ring',
  'Products/Rings/Petite Silver Turtle Micro AD Ring',
  'Products/Earrings/Silver Dual-Tone Ruby White Stone Studs',
  'Products/Earrings/Silver Tricolour Stone Stud Earrings',
  'Products/Earrings/Silver Floral Halo Pearl Stud Earrings',
  'Products/Earrings/Silver Uncut Synthetic Ruby Stud Earrings',
  'Products/Earrings/Silver Oval Emerald Stud Earrings'
]);

const categories = ['Earrings', 'God Small Statues', 'Neck Jewellery', 'Pendants', 'Rings'];

const remaining = {};
let total = 0;

for (const cat of categories) {
  remaining[cat] = [];
  const dir = path.resolve('Products', cat);
  if (!fs.existsSync(dir)) continue;
  const subs = fs.readdirSync(dir);
  for (const sub of subs) {
    const full = path.join(dir, sub);
    const rel = path.join('Products', cat, sub).replace(/\\/g, '/');
    if (fs.statSync(full).isDirectory()) {
      if (!usedFolders.has(rel)) {
        const files = fs.readdirSync(full);
        remaining[cat].push({
          folderName: sub,
          relPath: rel,
          files,
          fileCount: files.length
        });
        total++;
      }
    }
  }
}

console.log(`TOTAL REMAINING PRODUCTS: ${total}\n`);

for (const [cat, list] of Object.entries(remaining)) {
  console.log(`========================================`);
  console.log(`CATEGORY: ${cat} (${list.length} Products)`);
  console.log(`========================================`);
  list.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.folderName}`);
    console.log(`   Path: ${item.relPath}`);
    console.log(`   Images (${item.fileCount}): ${item.files.join(', ')}`);
  });
  console.log('');
}
