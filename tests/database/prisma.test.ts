/**
 * @jest-environment node
 */
import { prisma } from '../../backend/src/config/db';
import { expectPrismaAvailable } from '../helpers/db';

describe('Database integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects to PostgreSQL through Prisma', async () => {
    await expectPrismaAvailable();
  });

  it('has seeded products', async () => {
    await expect(prisma.product.count()).resolves.toBeGreaterThan(0);
  });

  it('has seeded categories', async () => {
    await expect(prisma.category.count()).resolves.toBeGreaterThan(0);
  });

  it('has seeded orders', async () => {
    await expect(prisma.order.count()).resolves.toBeGreaterThan(0);
  });

  it('has seeded customers', async () => {
    await expect(prisma.customer.count()).resolves.toBeGreaterThan(0);
  });

  it('has seeded coupons', async () => {
    await expect(prisma.coupon.count()).resolves.toBeGreaterThan(0);
  });

  it('has default CMS content', async () => {
    const cms = await prisma.cMSContent.findUnique({ where: { id: 'default' } });

    expect(cms?.footer).toBeDefined();
  });
});
