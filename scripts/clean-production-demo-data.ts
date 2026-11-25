import 'dotenv/config';
import { prisma } from '../backend/src/config/db';
import { SUPPLIER_PRODUCT_DRAFTS } from '../src/data/supplierProductBatches';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import { toProductCreateData } from '../backend/src/utils/serializers';

const RETAINED_IDS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.id));
const RETAINED_SKUS = new Set(SUPPLIER_PRODUCT_DRAFTS.map((p) => p.sku));

async function cleanProductionData() {
  console.log('=== STARTING PRODUCTION DATABASE CLEANUP ===');
  console.log(`Retained authentic supplier products count: ${RETAINED_IDS.size}`);

  // 1. Delete all demo reviews
  console.log('1. Cleaning demo reviews...');
  const deletedReviews = await prisma.productReview.deleteMany({
    where: {
      OR: [
        { id: { in: ['rev-1', 'rev-2'] } },
        { productId: { notIn: Array.from(RETAINED_IDS) } },
      ],
    },
  });
  console.log(`Deleted ${deletedReviews.count} demo product reviews.`);

  // 2. Delete all demo orders, order items, and related records
  console.log('2. Cleaning demo orders and order items...');
  const demoOrders = await prisma.order.findMany({
    where: {
      OR: [
        { id: { startsWith: 'ord-' } },
        { orderNumber: { startsWith: 'VED-' } },
        { orderNumber: { startsWith: 'GD-' } },
      ],
    },
    select: { id: true },
  });
  const demoOrderIds = demoOrders.map((o) => o.id);

  if (demoOrderIds.length > 0) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: demoOrderIds } } });
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: demoOrderIds } } });
    await prisma.payment.deleteMany({ where: { orderId: { in: demoOrderIds } } });
    await prisma.invoice.deleteMany({ where: { orderId: { in: demoOrderIds } } });
    const deletedOrders = await prisma.order.deleteMany({ where: { id: { in: demoOrderIds } } });
    console.log(`Deleted ${deletedOrders.count} demo orders.`);
  }

  // 3. Delete any remaining order items referencing demo products
  await prisma.orderItem.deleteMany({
    where: { productId: { notIn: Array.from(RETAINED_IDS) } },
  });

  // 4. Delete demo coupons
  console.log('3. Cleaning demo coupons...');
  const deletedCoupons = await prisma.coupon.deleteMany({
    where: {
      code: { in: ['WELCOME10', 'ROYALGEM', 'GURUGEMS'] },
    },
  });
  console.log(`Deleted ${deletedCoupons.count} demo coupons.`);

  // 5. Delete demo customers
  console.log('4. Cleaning demo customers...');
  const demoCustomers = await prisma.customer.findMany({
    where: {
      OR: [
        { id: { in: ['cust-101', 'cust-102', 'cust-103', 'cust-104', 'cust-105'] } },
        { email: { in: ['ananya.d@gmail.com', 'rajesh.singhania@gmail.com', 'kavita.n@gmail.com', 'vikram.rao@gmail.com', 'sunita.a@gmail.com', 'priya.iyer@yahoo.co.in'] } },
      ],
    },
    select: { id: true, email: true },
  });
  const demoCustomerIds = demoCustomers.map((c) => c.id);
  const demoCustomerEmails = demoCustomers.map((c) => c.email);

  if (demoCustomerIds.length > 0) {
    await prisma.address.deleteMany({
      where: {
        OR: [
          { customerId: { in: demoCustomerIds } },
          { email: { in: demoCustomerEmails } },
        ],
      },
    });
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          customerId: { in: demoCustomerIds },
        },
      },
    });
    await prisma.cart.deleteMany({ where: { customerId: { in: demoCustomerIds } } });
    await prisma.wishlistItem.deleteMany({ where: { customerId: { in: demoCustomerIds } } });
    const deletedCustomers = await prisma.customer.deleteMany({
      where: { id: { in: demoCustomerIds } },
    });
    console.log(`Deleted ${deletedCustomers.count} demo customer accounts.`);
  }

  // 6. Delete all demo products
  console.log('5. Cleaning demo products and dependent records...');
  const allDbProducts = await prisma.product.findMany({ select: { id: true, sku: true, name: true } });
  const demoProducts = allDbProducts.filter((p) => !RETAINED_IDS.has(p.id) && !RETAINED_SKUS.has(p.sku));
  const demoProductIds = demoProducts.map((p) => p.id);

  if (demoProductIds.length > 0) {
    await prisma.cartItem.deleteMany({ where: { productId: { in: demoProductIds } } });
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: demoProductIds } } });
    await prisma.inventoryItem.deleteMany({ where: { productId: { in: demoProductIds } } });
    await prisma.productMedia.deleteMany({ where: { productId: { in: demoProductIds } } });
    await prisma.productVariant.deleteMany({ where: { productId: { in: demoProductIds } } });
    const deletedProducts = await prisma.product.deleteMany({ where: { id: { in: demoProductIds } } });
    console.log(`Deleted ${deletedProducts.count} demo products from database.`);
  }

  // 7. Seed/Upsert the 16 authentic supplier products into the database
  console.log('6. Ensuring 16 authentic supplier products are present in database...');
  for (const product of INITIAL_PRODUCTS) {
    await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: product.id } });
      await tx.productMedia.deleteMany({ where: { productId: product.id } });
      await tx.inventoryItem.deleteMany({ where: { productId: product.id } });
      await tx.product.upsert({
        where: { id: product.id },
        create: {
          ...toProductCreateData(product),
          variants: { create: (product.variants || []).map((v) => ({ ...v, images: v.images || [] })) as any },
          media: { create: product.images.map((url, position) => ({ url, position })) },
          inventoryItems: { create: [{ sku: product.sku, quantity: product.totalStock }] },
        },
        update: {
          ...toProductCreateData(product),
          variants: { create: (product.variants || []).map((v) => ({ ...v, images: v.images || [] })) as any },
          media: { create: product.images.map((url, position) => ({ url, position })) },
          inventoryItems: { create: [{ sku: product.sku, quantity: product.totalStock }] },
        },
      });
    });
  }
  console.log('Seeded 16 authentic supplier products.');

  // 8. Final database state audit
  const finalOrders = await prisma.order.count();
  const finalCoupons = await prisma.coupon.count();
  const finalReviews = await prisma.productReview.count();
  const finalProducts = await prisma.product.count();
  const finalCustomers = await prisma.customer.count();

  console.log('=== CLEANUP COMPLETE ===');
  console.log({
    finalOrders,
    finalCoupons,
    finalReviews,
    finalProducts,
    finalCustomers,
  });
}

cleanProductionData()
  .catch((err) => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
