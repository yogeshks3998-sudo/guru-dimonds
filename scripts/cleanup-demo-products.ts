import 'dotenv/config';
import { SUPPLIER_PRODUCT_DRAFTS } from '../src/data/supplierProductBatches';

const args = new Set(process.argv.slice(2));
const hasDryRun = args.has('--dry-run');
const hasApply = args.has('--apply');

if (hasDryRun && hasApply) {
  throw new Error('Choose --dry-run or --apply, not both.');
}

const apply = hasApply;
const mode = apply ? 'apply' : 'dry-run';

const RETAINED_IDS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.id));
const RETAINED_SKUS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.sku));

async function main() {
  if (SUPPLIER_PRODUCT_DRAFTS.length !== 16) {
    throw new Error(`Expected exactly 16 supplier products in keep-list, found ${SUPPLIER_PRODUCT_DRAFTS.length}`);
  }

  console.log(`[CLEANUP] Retained supplier products keep-list count: ${SUPPLIER_PRODUCT_DRAFTS.length}`);

  if (!process.env.DATABASE_URL) {
    console.log(JSON.stringify({
      mode: 'database-unavailable-dry-run',
      message: 'DATABASE_URL not set. Database cleanup pending manual execution.',
      retainedCount: SUPPLIER_PRODUCT_DRAFTS.length,
    }, null, 2));
    return;
  }

  const { prisma } = await import('../backend/src/config/db');

  try {
    // 1. Fetch current products in database using raw query to avoid schema version conflicts
    const dbProducts = await prisma.$queryRaw<Array<{ id: string; sku: string; name: string; status: string }>>`
      SELECT id, sku, name, status FROM "Product"
    `;

    const demoProductsInDb = dbProducts.filter(
      (p) => !RETAINED_IDS.has(p.id) && !RETAINED_SKUS.has(p.sku)
    );

    // 2. Identify historical order references
    const orderItems = await prisma.$queryRaw<Array<{ productId: string }>>`
      SELECT DISTINCT "productId" FROM "OrderItem"
    `;
    const referencedProductIds = new Set(orderItems.map((oi) => oi.productId));

    const toArchive = demoProductsInDb.filter((p) => referencedProductIds.has(p.id));
    const toDelete = demoProductsInDb.filter((p) => !referencedProductIds.has(p.id));

    // 3. Check cart items to clean up
    const demoIds = demoProductsInDb.map((p) => p.id);
    let cartItemsToCleanCount = 0;
    if (demoIds.length > 0) {
      const cartItems = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "CartItem" WHERE "productId" = ANY(${demoIds})
      `;
      cartItemsToCleanCount = cartItems.length;
    }

    if (!apply) {
      console.log(JSON.stringify({
        mode: 'database-dry-run; no writes performed',
        databaseTotalProducts: dbProducts.length,
        demoProductsInDbCount: demoProductsInDb.length,
        willArchiveCount: toArchive.length,
        willArchiveList: toArchive.map((p) => ({ id: p.id, sku: p.sku, name: p.name, reason: 'Referenced in historical orders' })),
        willDeleteCount: toDelete.length,
        cartItemsToCleanCount,
        retainedSupplierProductsSafe: SUPPLIER_PRODUCT_DRAFTS.length,
        nextStep: 'Pass --apply to execute database cleanup'
      }, null, 2));
      return;
    }

    // 4. Apply mode: Execute safe, idempotent transaction
    console.log('[CLEANUP] Applying database changes in transaction...');
    const result = await prisma.$transaction(async (tx) => {
      // Archive products referenced by orders
      let archivedCount = 0;
      if (toArchive.length > 0) {
        const archiveIds = toArchive.map((p) => p.id);
        const updateRes = await tx.$executeRaw`
          UPDATE "Product" 
          SET status = 'ARCHIVED', "updatedAt" = NOW() 
          WHERE id = ANY(${archiveIds})
        `;
        archivedCount = Number(updateRes);
      }

      // Clean cart items referencing demo products
      let deletedCartItems = 0;
      if (demoIds.length > 0) {
        const cartRes = await tx.$executeRaw`
          DELETE FROM "CartItem" WHERE "productId" = ANY(${demoIds})
        `;
        deletedCartItems = Number(cartRes);
      }

      // Safely delete unreferenced demo products and their dependent items
      let deletedProductsCount = 0;
      if (toDelete.length > 0) {
        const deleteIds = toDelete.map((p) => p.id);

        await tx.$executeRaw`DELETE FROM "CartItem" WHERE "productId" = ANY(${deleteIds})`;
        await tx.$executeRaw`DELETE FROM "WishlistItem" WHERE "productId" = ANY(${deleteIds})`;
        await tx.$executeRaw`DELETE FROM "InventoryItem" WHERE "productId" = ANY(${deleteIds})`;
        await tx.$executeRaw`DELETE FROM "ProductMedia" WHERE "productId" = ANY(${deleteIds})`;
        await tx.$executeRaw`DELETE FROM "ProductVariant" WHERE "productId" = ANY(${deleteIds})`;
        const delRes = await tx.$executeRaw`DELETE FROM "Product" WHERE id = ANY(${deleteIds})`;
        deletedProductsCount = Number(delRes);
      }

      return {
        archivedCount,
        deletedProductsCount,
        deletedCartItems,
      };
    }, {
      isolationLevel: 'Serializable',
      maxWait: 30000,
      timeout: 30000,
    });

    console.log(JSON.stringify({
      mode: 'database-apply-complete',
      status: 'SUCCESS',
      archivedDemoProducts: result.archivedCount,
      archivedList: toArchive.map((p) => ({ id: p.id, sku: p.sku })),
      deletedUnreferencedDemoProducts: result.deletedProductsCount,
      clearedDemoCartItems: result.deletedCartItems,
      retainedProductsPreserved: SUPPLIER_PRODUCT_DRAFTS.length,
      ordersPreserved: 'All historical orders and order items intact',
    }, null, 2));

  } catch (error: any) {
    console.error('[CLEANUP ERROR]:', error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
