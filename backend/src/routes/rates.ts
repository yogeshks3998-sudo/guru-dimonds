import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toMetalRateData, toMetalRateResponse } from '../utils/serializers';
import type { MetalPurity, MetalRate, MetalType } from '../../../src/types';
import { requireRole } from '../middleware/auth';

export const ratesRouter = Router();

ratesRouter.get(
  '/metal-rates',
  asyncHandler(async (_req, res) => {
    const rates = await prisma.metalRate.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json(rates.map((rate) => toMetalRateResponse(rate as unknown as MetalRate)));
  })
);

ratesRouter.post(
  '/metal-rates',
  requireRole('OWNER', 'FINANCE'),
  asyncHandler(async (req, res) => {
    const body = req.body as {
      metal: MetalType;
      purity: MetalPurity;
      ratePerGram: number;
      notes?: string;
      updatedBy?: string;
    };
    const existing = await prisma.metalRate.findFirst({
      where: { metal: body.metal, purity: body.purity, status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
    });
    const now = new Date();
    const rate: MetalRate = {
      id: `mr-${Date.now()}`,
      metal: body.metal,
      purity: body.purity,
      ratePerGram: body.ratePerGram,
      previousRate: existing?.ratePerGram || 0,
      effectiveDate: now.toISOString().split('T')[0],
      effectiveTime: now.toTimeString().split(' ')[0].substring(0, 5),
      rateSource: 'Admin Manual Override / MCX Feed',
      notes: body.notes,
      updatedBy: body.updatedBy || 'Admin Owner',
      status: 'PUBLISHED',
      updatedAt: now.toISOString(),
    };

    await prisma.metalRate.updateMany({
      where: { metal: body.metal, purity: body.purity, status: 'PUBLISHED' },
      data: { status: 'ROLLED_BACK' },
    });
    const saved = await prisma.metalRate.create({ data: toMetalRateData(rate) });
    res.status(201).json(toMetalRateResponse(saved as unknown as MetalRate));
  })
);

ratesRouter.post(
  '/metal-rates/:id/rollback',
  requireRole('OWNER', 'FINANCE'),
  asyncHandler(async (req, res) => {
    const target = await prisma.metalRate.findUnique({ where: { id: String(req.params.id) } });
    if (!target) throw new HttpError(404, 'Metal rate not found');

    const now = new Date();
    const rollback: MetalRate = {
      ...(target as unknown as MetalRate),
      id: `mr-${Date.now()}`,
      ratePerGram: target.previousRate,
      previousRate: target.ratePerGram,
      status: 'PUBLISHED',
      updatedAt: now.toISOString(),
      notes: `Rollback from ${target.id}`,
    };
    const saved = await prisma.metalRate.create({ data: toMetalRateData(rollback) });
    res.status(201).json(toMetalRateResponse(saved as unknown as MetalRate));
  })
);
