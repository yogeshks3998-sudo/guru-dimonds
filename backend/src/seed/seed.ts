import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import { INITIAL_PRODUCTS } from '../../../src/data/mockProducts';
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
} from '../../../src/data/mockData';
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
} from '../utils/serializers';

async function seed() {
  console.log('Seeding PostgreSQL with current Guru Diamonds data...');
  const customerPasswordHash = await bcrypt.hash('password123', 12);
  const adminPasswordHash = await bcrypt.hash('admin123', 12);

  for (const category of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      create: toCategoryData(category),
      update: toCategoryData(category),
    });
  }

  for (const collection of INITIAL_COLLECTIONS) {
    await prisma.jewelleryCollection.upsert({
      where: { id: collection.id },
      create: toCollectionData(collection),
      update: toCollectionData(collection),
    });
  }

  for (const product of INITIAL_PRODUCTS) {
    await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: product.id } });
      await tx.productMedia.deleteMany({ where: { productId: product.id } });
      await tx.inventoryItem.deleteMany({ where: { productId: product.id } });
      await tx.product.upsert({
        where: { id: product.id },
        create: {
          ...toProductCreateData(product),
          variants: { create: product.variants as any },
          media: { create: product.images.map((url, position) => ({ url, position })) },
          inventoryItems: { create: [{ sku: product.sku, quantity: product.totalStock }] },
        },
        update: {
          ...toProductCreateData(product),
          variants: { create: product.variants as any },
          media: { create: product.images.map((url, position) => ({ url, position })) },
          inventoryItems: { create: [{ sku: product.sku, quantity: product.totalStock }] },
        },
      });
    });
  }

  for (const rate of INITIAL_METAL_RATES) {
    await prisma.metalRate.upsert({
      where: { id: rate.id },
      create: toMetalRateData(rate),
      update: toMetalRateData(rate),
    });
  }

  for (const customer of INITIAL_CUSTOMERS) {
    await prisma.$transaction(async (tx) => {
      await tx.address.deleteMany({ where: { customerId: customer.id } });
      await tx.customer.upsert({
        where: { id: customer.id },
        create: {
          ...toCustomerData(customer),
          passwordHash: customerPasswordHash,
          emailVerified: true,
          addresses: { create: customer.addresses.map((address) => toAddressData(address)) },
        },
        update: {
          ...toCustomerData(customer),
          passwordHash: customerPasswordHash,
          emailVerified: true,
          addresses: { create: customer.addresses.map((address) => toAddressData(address)) },
        },
      });
    });
  }

  const adminUsers = [
    {
      id: 'adm-super',
      name: 'Guru Diamonds Super Admin',
      email: 'superadmin@gurudimonds.in',
      role: 'SUPER_ADMIN',
    },
    {
      id: 'adm-owner',
      name: 'Guru Diamonds Owner',
      email: 'owner@gurudimonds.in',
      role: 'OWNER',
    },
    {
      id: 'adm-product',
      name: 'Product Manager',
      email: 'product.manager@gurudimonds.in',
      role: 'PRODUCT_MANAGER',
    },
    {
      id: 'adm-inventory',
      name: 'Inventory Manager',
      email: 'inventory.manager@gurudimonds.in',
      role: 'INVENTORY_MANAGER',
    },
    {
      id: 'adm-order',
      name: 'Order Manager',
      email: 'order.manager@gurudimonds.in',
      role: 'ORDER_MANAGER',
    },
    {
      id: 'adm-content',
      name: 'Content Manager',
      email: 'content.manager@gurudimonds.in',
      role: 'CONTENT_MANAGER',
    },
    {
      id: 'adm-finance',
      name: 'Finance Manager',
      email: 'finance.manager@gurudimonds.in',
      role: 'FINANCE',
    },
    {
      id: 'adm-staff',
      name: 'Store Staff',
      email: 'staff@gurudimonds.in',
      role: 'STAFF',
    },
  ];

  for (const admin of adminUsers) {
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      create: {
        ...admin,
        passwordHash: adminPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        active: true,
        lastLogin: null,
      },
      update: {
        name: admin.name,
        passwordHash: adminPasswordHash,
        role: admin.role,
        active: true,
      },
    });
  }

  for (const order of INITIAL_ORDERS) {
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          ...toOrderCreateData(order),
          items: { create: order.items as any },
          history: {
            create: order.history.map((step) => ({
              status: step.status,
              timestamp: new Date(step.timestamp),
              note: step.note,
              updatedBy: step.updatedBy,
            })),
          },
        },
        update: {
          ...toOrderCreateData(order),
          items: { create: order.items as any },
          history: {
            create: order.history.map((step) => ({
              status: step.status,
              timestamp: new Date(step.timestamp),
              note: step.note,
              updatedBy: step.updatedBy,
            })),
          },
        },
      });
    });
  }

  for (const coupon of INITIAL_COUPONS) {
    await prisma.coupon.upsert({
      where: { id: coupon.id },
      create: toCouponData(coupon),
      update: toCouponData(coupon),
    });
  }

  for (const review of INITIAL_REVIEWS) {
    await prisma.productReview.upsert({
      where: { id: review.id },
      create: toReviewData(review),
      update: toReviewData(review),
    });
  }

  await prisma.cMSContent.upsert({
    where: { id: 'default' },
    create: toCMSData(INITIAL_CMS),
    update: toCMSData(INITIAL_CMS),
  });

  for (const log of INITIAL_AUDIT_LOGS) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      create: { ...log, timestamp: new Date(log.timestamp) },
      update: { ...log, timestamp: new Date(log.timestamp) },
    });
  }

  console.log('Seed complete.');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
