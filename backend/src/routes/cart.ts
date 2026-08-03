import { Router } from 'express';
import { prisma } from '../config/db';
import { requireCustomer } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { cartInclude, toCartResponse } from '../utils/cart';

export const cartRouter = Router();

const getOrCreateCart = async (tx: any, customerId: string) =>
  tx.cart.upsert({
    where: { customerId },
    create: { customerId },
    update: {},
    include: cartInclude,
  });

cartRouter.get(
  '/cart',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(prisma, req.auth!.sub);
    res.json(await toCartResponse(prisma, cart));
  })
);

cartRouter.post(
  '/cart/items',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const customerId = req.auth!.sub;
    const productId = String(req.body.productId || '');
    const variantId = req.body.variantId ? String(req.body.variantId) : null;
    const quantity = Math.max(1, Number(req.body.quantity || 1));
    const product = await prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
    if (!product || product.status !== 'ACTIVE') throw new HttpError(404, 'Product is not available');
    if (variantId && !product.variants.some((variant: any) => variant.id === variantId && variant.enabled)) {
      throw new HttpError(400, 'Selected variant is not available');
    }

    const cart = await prisma.$transaction(async (tx: any) => {
      const currentCart = await getOrCreateCart(tx, customerId);
      const existing = currentCart.items.find((item: any) => item.productId === productId && item.variantId === variantId);
      if (existing) {
        await tx.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: currentCart.id,
            productId,
            variantId,
            quantity,
            selectedAttributes: req.body.selectedAttributes || {},
            customEngraving: req.body.customEngraving || null,
            giftWrap: Boolean(req.body.giftWrap),
            giftMessage: req.body.giftMessage || null,
          },
        });
      }
      return tx.cart.findUnique({ where: { id: currentCart.id }, include: cartInclude });
    });

    res.status(201).json(await toCartResponse(prisma, cart));
  })
);

cartRouter.patch(
  '/cart/items/:id',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const quantity = Number(req.body.quantity);
    const cart = await getOrCreateCart(prisma, req.auth!.sub);
    const item = cart.items.find((entry: any) => entry.id === String(req.params.id));
    if (!item) throw new HttpError(404, 'Cart item not found');

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: {
          quantity,
          giftWrap: req.body.giftWrap ?? item.giftWrap,
          giftMessage: req.body.giftMessage ?? item.giftMessage,
        },
      });
    }

    const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
    res.json(await toCartResponse(prisma, updated));
  })
);

cartRouter.delete(
  '/cart/items/:id',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(prisma, req.auth!.sub);
    const item = cart.items.find((entry: any) => entry.id === String(req.params.id));
    if (!item) throw new HttpError(404, 'Cart item not found');
    await prisma.cartItem.delete({ where: { id: item.id } });
    const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
    res.json(await toCartResponse(prisma, updated));
  })
);

cartRouter.delete(
  '/cart',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(prisma, req.auth!.sub);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    res.status(204).send();
  })
);

