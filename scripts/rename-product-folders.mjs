import fs from 'node:fs';
import path from 'node:path';

const mappings = {
  'Earrings': {
    'silver AD round stud': 'Silver Round Brilliant AD Stud Earrings',
    'silver AD stud': 'Silver Classic Solitaire AD Stud Earrings',
    'silver american ad square stud': 'Silver Princess Square AD Stud Earrings',
    'silver blue stud': 'Silver Blue Sapphire Crystal Stud Earrings',
    'silver coral cream flower': 'Silver Cream Coral Flower Stud Earrings',
    'silver coral red flower stud': 'Silver Red Coral Flower Stud Earrings',
    'silver emarold studs': 'Silver Radiant Emerald Stud Earrings',
    'silver emerald tops': 'Silver Oval Emerald Stud Earrings',
    'silver pearl studs': 'Silver Pristine Pearl Stud Earrings',
    'silver pearl tops': 'Silver Floral Halo Pearl Stud Earrings',
    'silver rose squats': 'Silver Natural Rose Quartz Stud Earrings',
    'silver ruby stud': 'Silver Classic Ruby Stud Earrings',
    'silver Ruby tops': 'Silver Uncut Synthetic Ruby Stud Earrings',
    'silver stione studes 2': 'Silver Tricolour Stone Stud Earrings',
    'silver stone tops or studs': 'Silver Dual-Tone Ruby White Stone Studs'
  },
  'God Small Statues': {
    'shanku 1': 'Natural Sacred Vamavarti Shankha 1',
    'shanku 2': 'Natural Sacred Vamavarti Shankha 2',
    'big plain shanku': 'Natural Large White Shankha Shell',
    'black shanku': 'Rare Natural Black Divine Shankha',
    'saligrama': 'Sacred Gandaki River Shaligram Shila',
    'spatika shiva linga': 'Natural Sphatika Shiva Lingam',
    'spatika small shiva lings': 'Mini Sphatika Shiva Lingam',
    'spatika turtle statue': 'Natural Sphatika Kurma Turtle Idol',
    'spatika turtlle statue 2': 'Carved Sphatika Kurma Turtle Idol'
  },
  'Neck Jewellery': {
    'green anex beats male': 'Natural Green Onyx Beaded Mala',
    'light green anex 3 layered male': 'Light Green Onyx 3-Layered Mala',
    'ruby long hara': 'Traditional Ruby Long Haar Necklace',
    'silver coral and perl long necless': 'Silver Coral and Pearl Long Necklace',
    'solver ruby necless gold polished': 'Gold-Plated Silver Ruby Necklace',
    'spinal red ovule hara': 'Natural Red Spinel Oval Beads Haar'
  },
  'Pendants': {
    'ayyappa rudraksha pendent': 'Lord Ayyappa Rudraksha Silver Pendant',
    'bottle green ganesha syntetic stone': 'Bottle Green Stone Ganesha Pendant',
    'chamundeshwari doller': 'Goddess Chamundeshwari Silver Pendant',
    'eye black pendent ovule': 'Evil Eye Protective Black Agate Pendant',
    'firoza pendent': 'Natural Firoza Turquoise Silver Pendant',
    'om ganapati doller': 'Sacred Om Ganapati Silver Pendant',
    'picock mope': 'Antique Peacock Motif Silver Pendant',
    'raghavendra doller': 'Guru Sri Raghavendra Swamy Silver Pendant',
    'ruby ayyapa pendent or doller': 'Ruby Lord Ayyappa Swamy Silver Pendant',
    'silver ayyappa pendent': 'Lord Ayyappa Embossed Silver Pendant',
    'snake doller': 'Sacred Naga Divine Silver Pendant',
    'sun pendent': 'Surya Bhagwan Sunburst Silver Pendant',
    'syntetic red ganapati pendent': 'Synthetic Red Ruby Ganesha Pendant',
    'white agate pendent': 'Natural White Agate Silver Pendant'
  },
  'Rings': {
    'Gomedhika ring': 'Natural Gomedhika Silver Ring',
    'Natural navarathna ring 2': 'Unisex Natural Navaratna Silver Ring 1ct',
    'Natural yellow sapphire ring': 'Natural Yellow Sapphire Oval 3ct Ring',
    'Natural yellow sapphire with Ruby ring': 'Natural Yellow Sapphire and Ruby Ring',
    'navarathna rinf round': 'Natural Navaratna Round 5ct Mens Ring',
    'navarathna ring square': 'Natural Navaratna Square Silver Ring',
    'ovel ruby ring male': 'Natural Ruby Oval 5ct Mens Ring',
    'red with yellow shepire male ring': 'Mens Yellow Sapphire and Ruby Dual Ring',
    'silver fancy ring': 'Silver Floral Filigree Band Ring',
    'silver gomedha ring': 'Auspicious Gomedha Hessonite Silver Ring',
    'silver pearl ring': 'Natural Freshwater Pearl Silver Ring',
    'Silver turtle ring': 'Silver Kurma Turtle White AD Ring',
    'Silver turtle ring 2': 'Silver Dual-Tone Kurma Turtle Ring',
    'silver yellow saphire ring': 'Natural Yellow Sapphire Round 4ct Ring',
    'silver yellow shepire 3': 'Natural Yellow Sapphire Oval 2.5ct Ring',
    'silver yellow sphire 2': 'Natural Yellow Sapphire Classic Ring',
    'turtle ad ring small stone': 'Petite Silver Turtle Micro AD Ring',
    'turtle blue ring': 'Silver Turtle Blue Sapphire Ring',
    'turtle swuare ad': 'Silver Square Crest Turtle AD Ring'
  }
};

const results = [];
let successCount = 0;

for (const [category, items] of Object.entries(mappings)) {
  for (const [oldName, newName] of Object.entries(items)) {
    const catDir = path.resolve('Products', category);
    const oldPath = path.join(catDir, oldName);
    const newPath = path.join(catDir, newName);

    if (!fs.existsSync(oldPath)) {
      results.push({ category, oldName, newName, status: 'NOT_FOUND', fileCount: 0 });
      continue;
    }

    const filesBefore = fs.readdirSync(oldPath);
    const tempPath = path.join(catDir, `__temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

    fs.renameSync(oldPath, tempPath);
    fs.renameSync(tempPath, newPath);

    const filesAfter = fs.readdirSync(newPath);
    if (filesAfter.length === filesBefore.length) {
      results.push({ category, oldName, newName, status: 'RENAMED', fileCount: filesAfter.length });
      successCount++;
    } else {
      results.push({ category, oldName, newName, status: 'FILE_MISMATCH', fileCountBefore: filesBefore.length, fileCountAfter: filesAfter.length });
    }
  }
}

fs.writeFileSync(path.resolve('Products', 'folder-rename-map.json'), JSON.stringify(results, null, 2), 'utf8');

let md = '# Products Folder Renaming Report\n\nDate: ' + new Date().toISOString() + '\n\n';
md += '| Category | Original Folder Name | New Market-Ready Folder Name | File Count | Status |\n';
md += '|---|---|---|---|---|\n';
for (const r of results) {
  md += `| ${r.category} | \`${r.oldName}\` | **${r.newName}** | ${r.fileCount} | ✅ ${r.status} |\n`;
}
fs.writeFileSync(path.resolve('Products', 'FOLDER_RENAMING_REPORT.md'), md, 'utf8');

console.log(`Successfully renamed ${successCount} of ${results.length} folders!`);
