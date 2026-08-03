import { Router } from 'express';
import { prisma } from '../config/db';
import { requireCustomer } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

export const wishlistRouter = Router();

wishlistRouter.get(
  '/wishlist',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { customerId: req.auth!.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ productIds: items.map((item: any) => item.productId) });
  })
);

wishlistRouter.post(
  '/wishlist/items',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const productId = String(req.body.productId || '');
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'ACTIVE') throw new HttpError(404, 'Product is not available');
    await prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId: req.auth!.sub, productId } },
      create: { customerId: req.auth!.sub, productId },
      update: {},
    });
    const items = await prisma.wishlistItem.findMany({ where: { customerId: req.auth!.sub } });
    res.status(201).json({ productIds: items.map((item: any) => item.productId) });
  })
);

wishlistRouter.delete(
  '/wishlist/items/:productId',
  requireCustomer,
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({
      where: { customerId: req.auth!.sub, productId: String(req.params.productId) },
    });
    const items = await prisma.wishlistItem.findMany({ where: { customerId: req.auth!.sub } });
    res.json({ productIds: items.map((item: any) => item.productId) });
  })
);

wishlistRouter.delete(
  '/wishlist',
  requireCustomer,
  asyncHandler(async (req, res) => {
    await prisma.wishlistItem.deleteMany({ where: { customerId: req.auth!.sub } });
    res.status(204).send();
  })
);

