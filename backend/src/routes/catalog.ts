import { Router } from 'express';
import { prisma, transactionOptions } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toCategoryData, toCollectionData, toProductCreateData, toProductResponse } from '../utils/serializers';
import type { Category, Collection, Product } from '../../../src/types';
import { requireRole } from '../middleware/auth';
import { supplierPublicationError, isDemoProduct } from '../../../src/utils/supplierProducts';
import { isCanonicalCategory } from '../../../src/utils/productFilters';
import { SUPPLIER_PRODUCT_DRAFTS } from '../../../src/data/supplierProductBatches';

function validateSupplierProduct(product: Product, previous?: Product) {
  const original = SUPPLIER_PRODUCT_DRAFTS.find((p) => p.id === product.id || p.sku === product.sku);
  const review = previous?.supplierReview || original?.supplierReview;
  if (review && !product.supplierReview) throw new HttpError(400, 'Supplier review metadata must be retained.');
  if (review && product.supplierReview) product.supplierReview.raw = review.raw;
  if (product.status === 'ACTIVE' || product.status === 'SCHEDULED') {
    const error = supplierPublicationError(product);
    if (error) throw new HttpError(400, error);
  }
}

export const catalogRouter = Router();

const toVariantCreateData = (variant: any): Record<string, any> => ({
  id: variant.id,
  sku: String(variant.sku || '').trim(),
  barcode: variant.barcode || variant.sku || '',
  attributes: variant.attributes || {},
  price: Number(variant.price || 0),
  compareAtPrice: variant.compareAtPrice !== undefined && variant.compareAtPrice !== null ? Number(variant.compareAtPrice) : null,
  netWeightGrams: Number(variant.netWeightGrams || 0),
  grossWeightGrams: Number(variant.grossWeightGrams || 0),
  stock: Number(variant.stock || 0),
  images: variant.images || [],
  enabled: variant.enabled !== false,
  dispatchTimeDays: Number(variant.dispatchTimeDays || 3),
});

catalogRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const allCategories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    const categories = allCategories.filter((c) => isCanonicalCategory(c));
    res.json(categories.length > 0 ? categories : allCategories);
  })
);

catalogRouter.put(
  '/categories/:id',
  requireRole('OWNER', 'PRODUCT_MANAGER'),
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

catalogRouter.delete(
  '/categories/:id',
  requireRole('OWNER', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    await prisma.category.delete({ where: { id } }).catch(() => {});
    res.status(204).send();
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
  requireRole('OWNER', 'PRODUCT_MANAGER', 'CONTENT_MANAGER'),
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

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
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
    } catch {
      const rawProducts: any[] = await prisma.$queryRaw`
        SELECT p.*, 
               COALESCE(json_agg(v.*) FILTER (WHERE v.id IS NOT NULL), '[]') as variants
        FROM "Product" p
        LEFT JOIN "ProductVariant" v ON v."productId" = p.id
        GROUP BY p.id
        ORDER BY p."updatedAt" DESC
      `;
      products = rawProducts;
    }

    const sanitized = products
      .filter((p) => !isDemoProduct(p.id) && !isDemoProduct(p.sku) && p.status !== 'ARCHIVED')
      .map((product) => toProductResponse(product as unknown as Product));

    res.json(sanitized);
  })
);

catalogRouter.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug);
    if (isDemoProduct(slug)) throw new HttpError(404, 'Product not found');

    let product: any = null;
    try {
      product = await prisma.product.findUnique({
        where: { slug },
        include: { variants: true },
      });
    } catch {
      const rawProducts: any[] = await prisma.$queryRaw`
        SELECT p.*, 
               COALESCE(json_agg(v.*) FILTER (WHERE v.id IS NOT NULL), '[]') as variants
        FROM "Product" p
        LEFT JOIN "ProductVariant" v ON v."productId" = p.id
        WHERE p.slug = ${slug}
        GROUP BY p.id
        LIMIT 1
      `;
      product = rawProducts[0] || null;
    }

    if (!product || isDemoProduct(product.id) || isDemoProduct(product.sku) || product.status === 'ARCHIVED') {
      throw new HttpError(404, 'Product not found');
    }
    res.json(toProductResponse(product as unknown as Product));
  })
);

catalogRouter.post(
  '/products',
  requireRole('OWNER', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const product = req.body as Product;
    validateSupplierProduct(product);
    const saved = await prisma.product.create({
      data: {
        ...toProductCreateData(product),
        variants: { create: (product.variants || []).map(toVariantCreateData) },
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
    res.status(201).json(toProductResponse(saved as unknown as Product));
  })
);

catalogRouter.put(
  '/products/:id',
  requireRole('OWNER', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!existingProduct) {
      throw new HttpError(404, 'Product not found');
    }

    const product = { ...(req.body as Product), id };
    validateSupplierProduct(product, existingProduct as unknown as Product);
    const incomingVariants = product.variants || [];

    // 1. Validation: Prevent duplicate SKUs within incoming variants
    const incomingSkus = incomingVariants.map((v) => String(v.sku || '').trim().toUpperCase()).filter(Boolean);
    const uniqueSkus = new Set(incomingSkus);
    if (uniqueSkus.size !== incomingSkus.length) {
      throw new HttpError(400, 'Duplicate SKUs detected in incoming variants payload');
    }

    // 2. Validation: Prevent cross-product variant modification and duplicate global SKUs
    for (const v of incomingVariants) {
      if (v.id) {
        const otherVariant = await prisma.productVariant.findUnique({ where: { id: v.id } });
        if (otherVariant && otherVariant.productId !== id) {
          throw new HttpError(403, `Variant ${v.id} belongs to a different product`);
        }
      }

      if (v.sku) {
        const cleanSku = v.sku.trim().toUpperCase();
        const existingWithSku = await prisma.productVariant.findUnique({
          where: { sku: cleanSku },
        });
        if (existingWithSku && existingWithSku.productId !== id) {
          throw new HttpError(400, `SKU ${v.sku} is already in use by another product variant`);
        }
      }
    }

    // 3. Safe Transactional Variant Synchronization
    const saved = await prisma.$transaction(async (tx) => {
      // a. Update core product metadata
      await tx.product.update({
        where: { id },
        data: toProductCreateData(product),
      });

      // b. Synchronize variants using stable IDs
      const existingVariantMap = new Map(existingProduct.variants.map((v) => [v.id, v]));
      const processedVariantIds = new Set<string>();

      for (const variant of incomingVariants) {
        let targetVariantId = variant.id;

        // If ID matches existing variant belonging to this product -> Update in-place
        if (targetVariantId && existingVariantMap.has(targetVariantId)) {
          await tx.productVariant.update({
            where: { id: targetVariantId },
            data: {
              sku: variant.sku.trim(),
              barcode: variant.barcode || variant.sku,
              attributes: variant.attributes || {},
              price: Number(variant.price || 0),
              compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
              netWeightGrams: Number(variant.netWeightGrams || 0),
              grossWeightGrams: Number(variant.grossWeightGrams || 0),
              stock: Number(variant.stock || 0),
              images: variant.images || [],
              enabled: variant.enabled !== false,
              dispatchTimeDays: Number(variant.dispatchTimeDays || 3),
            },
          });
          processedVariantIds.add(targetVariantId);
        } else {
          // If no ID or ID not present in existing map, check if SKU already belongs to this product
          const matchingBySku = existingProduct.variants.find(
            (v) => v.sku.toUpperCase() === variant.sku.trim().toUpperCase()
          );

          if (matchingBySku) {
            targetVariantId = matchingBySku.id;
            await tx.productVariant.update({
              where: { id: targetVariantId },
              data: {
                barcode: variant.barcode || variant.sku,
                attributes: variant.attributes || {},
                price: Number(variant.price || 0),
                compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
                netWeightGrams: Number(variant.netWeightGrams || 0),
                grossWeightGrams: Number(variant.grossWeightGrams || 0),
                stock: Number(variant.stock || 0),
                images: variant.images || [],
                enabled: variant.enabled !== false,
                dispatchTimeDays: Number(variant.dispatchTimeDays || 3),
              },
            });
            processedVariantIds.add(targetVariantId);
          } else {
            // New variant -> Create cleanly
            const newId = variant.id || `var-${id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await tx.productVariant.create({
              data: {
                id: newId,
                productId: id,
                sku: variant.sku.trim(),
                barcode: variant.barcode || variant.sku,
                attributes: variant.attributes || {},
                price: Number(variant.price || 0),
                compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
                netWeightGrams: Number(variant.netWeightGrams || 0),
                grossWeightGrams: Number(variant.grossWeightGrams || 0),
                stock: Number(variant.stock || 0),
                images: variant.images || [],
                enabled: variant.enabled !== false,
                dispatchTimeDays: Number(variant.dispatchTimeDays || 3),
              },
            });
            processedVariantIds.add(newId);
          }
        }
      }

      // c. Handle removed variants safely without breaking cart or order references
      for (const oldVariant of existingProduct.variants) {
        if (!processedVariantIds.has(oldVariant.id)) {
          const [cartCount, orderCount] = await Promise.all([
            tx.cartItem.count({ where: { variantId: oldVariant.id } }),
            tx.orderItem.count({ where: { variantId: oldVariant.id } }),
          ]);

          if (cartCount > 0 || orderCount > 0) {
            // Do NOT delete: Retire / disable the variant to preserve relational integrity
            await tx.productVariant.update({
              where: { id: oldVariant.id },
              data: { enabled: false, stock: 0 },
            });
          } else {
            // Safe to delete because no carts or orders reference it
            await tx.productVariant.delete({ where: { id: oldVariant.id } });
          }
        }
      }

      // d. Synchronize inventory item non-destructively
      const existingInv = await tx.inventoryItem.findFirst({
        where: { productId: id, sku: product.sku },
      });
      if (existingInv) {
        await tx.inventoryItem.update({
          where: { id: existingInv.id },
          data: { quantity: Number(product.totalStock || 0) },
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            productId: id,
            sku: product.sku,
            quantity: Number(product.totalStock || 0),
            reserved: 0,
          },
        });
      }

      // e. Synchronize product media non-destructively
      await tx.productMedia.deleteMany({ where: { productId: id } });
      if (product.images && product.images.length > 0) {
        await tx.productMedia.createMany({
          data: product.images.map((url, position) => ({ productId: id, url, position })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { variants: true },
      });
    }, transactionOptions);

    res.json(toProductResponse(saved as unknown as Product));
  })
);

catalogRouter.delete(
  '/products/:id',
  requireRole('OWNER', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  })
);
