import { prisma } from '../backend/src/config/db';
import bcrypt from 'bcryptjs';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_CMS,
  INITIAL_COLLECTIONS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_METAL_RATES,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
} from '../src/data/mockData';
import {
  toAddressData,
  toCategoryData,
  toCMSData,
  toCollectionData,
  toCouponData,
  toCustomerData,
  toMetalRateData,
  toOrderCreateData,
  toProductCreateData,
  toReviewData,
} from '../backend/src/utils/serializers';

async function fastSeed() {
  console.log(`Starting fast database sync for ${INITIAL_PRODUCTS.length} products...`);
  const start = Date.now();

  // 1. Categories
  for (const category of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: toCategoryData(category),
      update: toCategoryData(category),
    });
  }
  console.log(`✓ Categories synced (${INITIAL_CATEGORIES.length})`);

  // 2. Collections
  for (const collection of INITIAL_COLLECTIONS) {
    await prisma.jewelleryCollection.upsert({
      where: { slug: collection.slug },
      create: toCollectionData(collection),
      update: toCollectionData(collection),
    });
  }
  console.log(`✓ Collections synced (${INITIAL_COLLECTIONS.length})`);

  // 3. Clean up obsolete demo products
  const activeIds = INITIAL_PRODUCTS.map((p) => p.id);
  await prisma.cartItem.deleteMany({ where: { productId: { notIn: activeIds } } });
  await prisma.orderItem.deleteMany({ where: { productId: { notIn: activeIds } } });
  await prisma.productReview.deleteMany({ where: { productId: { notIn: activeIds } } });
  await prisma.productVariant.deleteMany({ where: { productId: { notIn: activeIds } } });
  await prisma.productMedia.deleteMany({ where: { productId: { notIn: activeIds } } });
  await prisma.inventoryItem.deleteMany({ where: { productId: { notIn: activeIds } } });
  await prisma.product.deleteMany({ where: { id: { notIn: activeIds } } });
  console.log(`✓ Obsolete demo products purged from database`);

  // 4. Products in batches
  for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
    const product = INITIAL_PRODUCTS[i];
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    await prisma.inventoryItem.deleteMany({ where: { productId: product.id } });

    await prisma.product.upsert({
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

    if ((i + 1) % 15 === 0 || i === INITIAL_PRODUCTS.length - 1) {
      console.log(`  Processed ${i + 1}/${INITIAL_PRODUCTS.length} products...`);
    }
  }
  console.log(`✓ All ${INITIAL_PRODUCTS.length} real products synced to PostgreSQL!`);

  // 5. Metal rates
  for (const rate of INITIAL_METAL_RATES) {
    await prisma.metalRate.upsert({
      where: { id: rate.id },
      create: toMetalRateData(rate),
      update: toMetalRateData(rate),
    });
  }

  // 6. Customers & Admins
  const passwordHash = await bcrypt.hash('password123', 10);
  for (const customer of INITIAL_CUSTOMERS) {
    await prisma.address.deleteMany({ where: { OR: [{ customerId: customer.id }, { email: customer.email }] } });
    await prisma.customer.upsert({
      where: { email: customer.email },
      create: {
        ...toCustomerData(customer),
        passwordHash,
        emailVerified: true,
        addresses: { create: customer.addresses.map((a) => toAddressData(a)) },
      },
      update: {
        ...toCustomerData(customer),
        passwordHash,
        emailVerified: true,
        addresses: { create: customer.addresses.map((a) => toAddressData(a)) },
      },
    });
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@gurudiamonds.in' },
    create: {
      id: 'adm-super-1',
      name: 'Guru Diamonds Admin',
      email: 'admin@gurudiamonds.in',
      role: 'SUPER_ADMIN',
      passwordHash: adminHash,
      avatar: '/assets/gurudimondslogo.png',
      active: true,
    },
    update: {
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      active: true,
    },
  });

  // 7. Orders
  for (const order of INITIAL_ORDERS) {
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
    await prisma.order.upsert({
      where: { id: order.id },
      create: {
        ...toOrderCreateData(order),
        items: { create: order.items as any },
        history: {
          create: order.history.map((h) => ({
            status: h.status,
            timestamp: new Date(h.timestamp),
            note: h.note,
            updatedBy: h.updatedBy,
          })),
        },
      },
      update: {
        ...toOrderCreateData(order),
        items: { create: order.items as any },
        history: {
          create: order.history.map((h) => ({
            status: h.status,
            timestamp: new Date(h.timestamp),
            note: h.note,
            updatedBy: h.updatedBy,
          })),
        },
      },
    });
  }

  // 8. Reviews
  for (const review of INITIAL_REVIEWS) {
    await prisma.productReview.upsert({
      where: { id: review.id },
      create: toReviewData(review),
      update: toReviewData(review),
    });
  }

  // 9. CMS
  await prisma.cMSContent.upsert({
    where: { id: 'default' },
    create: toCMSData(INITIAL_CMS),
    update: toCMSData(INITIAL_CMS),
  });

  console.log(`\n🎉 DATABASE SYNC COMPLETE in ${((Date.now() - start) / 1000).toFixed(1)}s!`);
}

fastSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
