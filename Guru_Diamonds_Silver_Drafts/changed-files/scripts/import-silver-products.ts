import 'dotenv/config';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import { SILVER_COLLECTION_PRODUCTS } from '../src/data/silverCollectionProducts';
import { planSilverImport, applySilverImport } from './lib/import-silver-products';

const args = new Set(process.argv.slice(2));
if ([...args].some((arg) => !['--dry-run', '--database', '--apply'].includes(arg))) throw new Error('Supported options: --dry-run, --database, --apply');
if (args.has('--dry-run') && args.has('--apply')) throw new Error('Choose --dry-run or --apply, not both.');
const apply = args.has('--apply');
const useDatabase = args.has('--database') || apply;
const unique = (key: 'id' | 'sku' | 'slug') => new Set(SILVER_COLLECTION_PRODUCTS.map((p) => p[key])).size === 10;
if (!['id', 'sku', 'slug'].every((key) => unique(key as 'id' | 'sku' | 'slug'))
 || SILVER_COLLECTION_PRODUCTS.some((p) => p.status !== 'DRAFT' || p.images.length || p.enabled !== false || p.totalStock !== 0 || p.certified || p.hallmarked || !p.supplierReview?.issues.length)) throw new Error('Supplier batch safety validation failed');

if (!useDatabase) {
  const existing = INITIAL_PRODUCTS.filter((p) => !SILVER_COLLECTION_PRODUCTS.some((n) => n.id === p.id));
  const plan = planSilverImport(existing);
  console.log(JSON.stringify({ mode: 'repository-validation-only; database not inspected or modified', validated: 10, wouldCreate: plan.create.map((p) => p.sku), skipped: plan.skip }, null, 2));
} else {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; no database writes attempted.');
  const { prisma } = await import('../backend/src/config/db');
  try {
    if (apply) {
      const result = await prisma.$transaction(applySilverImport, { isolationLevel: 'Serializable', maxWait: 30000, timeout: 30000 });
      console.log(JSON.stringify({ mode: 'database-apply', ...result }, null, 2));
    } else {
      const plan = planSilverImport(await prisma.product.findMany({ include: { variants: true } }));
      console.log(JSON.stringify({ mode: 'database-dry-run; no writes', wouldCreate: plan.create.map((p) => p.sku), skipped: plan.skip }, null, 2));
    }
  } finally { await prisma.$disconnect(); }
}
