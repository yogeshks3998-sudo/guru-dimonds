import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/http';
import { toCouponData } from '../utils/serializers';
import type { Coupon } from '../../../src/types';

export const couponsRouter = Router();

const toCouponResponse = (coupon: Coupon): Coupon =>
  ({
    ...coupon,
    applicableCategories: coupon.applicableCategories || undefined,
    startDate: new Date(coupon.startDate).toISOString(),
    endDate: new Date(coupon.endDate).toISOString(),
  }) as Coupon;

couponsRouter.get(
  '/coupons',
  asyncHandler(async (_req, res) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { code: 'asc' } });
    res.json(coupons.map((coupon) => toCouponResponse(coupon as unknown as Coupon)));
  })
);

couponsRouter.post(
  '/coupons',
  asyncHandler(async (req, res) => {
    const coupon = req.body as Coupon;
    const saved = await prisma.coupon.upsert({
      where: { id: coupon.id },
      create: toCouponData(coupon),
      update: toCouponData(coupon),
    });
    res.status(201).json(toCouponResponse(saved as unknown as Coupon));
  })
);

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

