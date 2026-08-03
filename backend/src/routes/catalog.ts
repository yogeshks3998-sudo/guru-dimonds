import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toCategoryData, toCollectionData, toProductCreateData, toProductResponse } from '../utils/serializers';
import type { Category, Collection, Product } from '../../../src/types';

export const catalogRouter = Router();

catalogRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  })
);

catalogRouter.put(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const category = req.body as Category;
    const id = String(req.params.id);
    const saved = await prisma.category.upsert({
      where: { id },
      create: toCategoryData({ ...category, id }),
      update: toCategoryData({ ...category, id }),
    });
    res.json(saved);
  })
);

catalogRouter.get(
  '/collections',
  asyncHandler(async (_req, res) => {
    const collections = await prisma.jewelleryCollection.findMany({ orderBy: { name: 'asc' } });
    res.json(collections);
  })
);

catalogRouter.put(
  '/collections/:id',
  asyncHandler(async (req, res) => {
    const collection = req.body as Collection;
    const id = String(req.params.id);
    const saved = await prisma.jewelleryCollection.upsert({
      where: { id },
      create: toCollectionData({ ...collection, id }),
      update: toCollectionData({ ...collection, id }),
    });
    res.json(saved);
  })
);

catalogRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { variants: true },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(products.map((product) => toProductResponse(product as unknown as Product)));
  })
);

catalogRouter.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: String(req.params.slug) },
      include: { variants: true },
    });
    if (!product) throw new HttpError(404, 'Product not found');
    res.json(toProductResponse(product as unknown as Product));
  })
);

catalogRouter.post(
  '/products',
  asyncHandler(async (req, res) => {
    const product = req.body as Product;
    const saved = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...toProductCreateData(product),
          variants: { create: product.variants as any },
          media: {
            create: product.images.map((url, position) => ({ url, position })),
          },
          inventoryItems: {
            create: [
              {
                sku: product.sku,
                quantity: product.totalStock,
              },
            ],
          },
        },
        include: { variants: true },
      });
      return created;
    });
    res.status(201).json(toProductResponse(saved as unknown as Product));
  })
);

catalogRouter.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const product = { ...(req.body as Product), id };
    const saved = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productMedia.deleteMany({ where: { productId: id } });
      await tx.inventoryItem.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...toProductCreateData(product),
          variants: { create: product.variants as any },
          media: {
            create: product.images.map((url, position) => ({ url, position })),
          },
          inventoryItems: {
            create: [
              {
                sku: product.sku,
                quantity: product.totalStock,
              },
            ],
          },
        },
        include: { variants: true },
      });
    });
    res.json(toProductResponse(saved as unknown as Product));
  })
);

catalogRouter.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  })
);
