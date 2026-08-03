import { prisma } from '../../backend/src/config/db';

export const expectPrismaAvailable = async () => {
  await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
};

export const cleanupProduct = async (id: string) => {
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.productMedia.deleteMany({ where: { productId: id } });
  await prisma.inventoryItem.deleteMany({ where: { productId: id } });
  await prisma.product.deleteMany({ where: { id } });
};

export const cleanupOrder = async (id: string) => {
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: id } });
  await prisma.payment.deleteMany({ where: { orderId: id } });
  await prisma.invoice.deleteMany({ where: { orderId: id } });
  await prisma.emailLog.deleteMany({ where: { orderId: id } });
  await prisma.order.deleteMany({ where: { id } });
};
