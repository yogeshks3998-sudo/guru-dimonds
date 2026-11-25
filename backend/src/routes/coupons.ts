import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toCouponData } from '../utils/serializers';
import type { Coupon } from '../../../src/types';
import { extractAuthToken, requireRole } from '../middleware/auth';

export const couponsRouter = Router();

const toCouponResponse = (coupon: Coupon): Coupon =>
  ({
    ...coupon,
    applicableCategories: coupon.applicableCategories || undefined,
    startDate: new Date(coupon.startDate).toISOString(),
    endDate: new Date(coupon.endDate).toISOString(),
  }) as Coupon;

// GET /api/coupons
// Admins (OWNER, ORDER_MANAGER, SUPER_ADMIN) receive all coupons (active, draft, expired).
// Public visitors / customers receive only active, currently valid coupons.
couponsRouter.get(
  '/coupons',
  asyncHandler(async (req, res) => {
    const auth = extractAuthToken(req);
    const isAdmin = auth?.type === 'ADMIN' && ['OWNER', 'ORDER_MANAGER', 'SUPER_ADMIN'].includes(auth.role || '');

    if (isAdmin) {
      const coupons = await prisma.coupon.findMany({ orderBy: { code: 'asc' } });
      res.json(coupons.map((coupon) => toCouponResponse(coupon as unknown as Coupon)));
      return;
    }

    const now = new Date();
    const publicCoupons = await prisma.coupon.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { code: 'asc' },
    });

    res.json(publicCoupons.map((coupon) => toCouponResponse(coupon as unknown as Coupon)));
  })
);

// POST /api/coupons - Restricted to OWNER and ORDER_MANAGER
couponsRouter.post(
  '/coupons',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const coupon = req.body as Coupon;
    if (!coupon.code || !coupon.discountType || typeof coupon.discountValue !== 'number') {
      throw new HttpError(400, 'Invalid coupon data: code, discountType and discountValue are required');
    }

    const saved = await prisma.coupon.upsert({
      where: { id: coupon.id },
      create: toCouponData(coupon),
      update: toCouponData(coupon),
    });
    res.status(201).json(toCouponResponse(saved as unknown as Coupon));
  })
);

// PUT /api/coupons/:id - Restricted to OWNER and ORDER_MANAGER
couponsRouter.put(
  '/coupons/:id',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const coupon = req.body as Coupon;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Coupon not found');
    }

    const saved = await prisma.coupon.update({
      where: { id },
      data: toCouponData({ ...coupon, id }),
    });
    res.json(toCouponResponse(saved as unknown as Coupon));
  })
);

// DELETE /api/coupons/:id - Restricted to OWNER and ORDER_MANAGER
couponsRouter.delete(
  '/coupons/:id',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Coupon not found');
    }

    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true, message: 'Coupon deleted successfully' });
  })
);

// POST /api/coupons/validate - Public storefront validation endpoint
couponsRouter.post(
  '/coupons/validate',
  asyncHandler(async (req, res) => {
    const code = String(req.body.code || '').trim().toUpperCase();
    const subtotal = Number(req.body.subtotal || 0);
    const now = new Date();
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.active || coupon.startDate > now || coupon.endDate < now) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
      return;
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
      return;
    }

    if (subtotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Coupon code requires a minimum order amount of Rs ${coupon.minOrderAmount.toLocaleString('en-IN')}.`,
      });
      return;
    }

    res.json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully!`,
      coupon: toCouponResponse(coupon as unknown as Coupon),
    });
  })
);
