import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toMetalRateData, toMetalRateResponse } from '../utils/serializers';
import type { MetalPurity, MetalRate, MetalType } from '../../../src/types';
import { requireRole } from '../middleware/auth';

export const ratesRouter = Router();

const generateSafeRateId = (index?: number) => {
  const suffix = Math.random().toString(36).substring(2, 8);
  return `mr-${Date.now()}${index !== undefined ? `-${index}` : ''}-${suffix}`;
};

ratesRouter.get(
  '/metal-rates',
  asyncHandler(async (_req, res) => {
    const rates = await prisma.metalRate.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json(rates.map((rate) => toMetalRateResponse(rate as unknown as MetalRate)));
  })
);

// Bulk Rate Shift & Batch Publishing Endpoint
ratesRouter.post(
  '/metal-rates/bulk',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const body = req.body as {
      items: Array<{
        metal: MetalType;
        purity: MetalPurity;
        ratePerGram: number;
        notes?: string;
        updatedBy?: string;
      }>;
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new HttpError(400, 'items array must be provided');
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const savedRates = await prisma.$transaction(async (tx) => {
      const results: MetalRate[] = [];

      for (let idx = 0; idx < body.items.length; idx++) {
        const item = body.items[idx];
        const existing = await tx.metalRate.findFirst({
          where: { metal: item.metal, purity: item.purity, status: 'PUBLISHED' },
          orderBy: { updatedAt: 'desc' },
        });

        const rate: MetalRate = {
          id: generateSafeRateId(idx),
          metal: item.metal,
          purity: item.purity,
          ratePerGram: Number(item.ratePerGram),
          previousRate: existing ? existing.ratePerGram : Number(item.ratePerGram),
          effectiveDate: dateStr,
          effectiveTime: timeStr,
          rateSource: 'Admin Bulk Shift / MCX Feed',
          notes: item.notes || 'Bulk Shift Adjustment',
          updatedBy: item.updatedBy || 'Admin Owner',
          status: 'PUBLISHED',
          updatedAt: now.toISOString(),
        };

        // Mark existing active rates as rolled back
        await tx.metalRate.updateMany({
          where: { metal: item.metal, purity: item.purity, status: 'PUBLISHED' },
          data: { status: 'ROLLED_BACK' },
        });

        // Insert new published rate
        const created = await tx.metalRate.create({
          data: toMetalRateData(rate),
        });

        results.push(toMetalRateResponse(created as unknown as MetalRate));
      }

      return results;
    });

    res.status(201).json(savedRates);
  })
);

// Single Rate Publishing Endpoint
ratesRouter.post(
  '/metal-rates',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const body = req.body as {
      metal: MetalType;
      purity: MetalPurity;
      ratePerGram: number;
      notes?: string;
      updatedBy?: string;
    };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const saved = await prisma.$transaction(async (tx) => {
      const existing = await tx.metalRate.findFirst({
        where: { metal: body.metal, purity: body.purity, status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
      });

      const rate: MetalRate = {
        id: generateSafeRateId(),
        metal: body.metal,
        purity: body.purity,
        ratePerGram: Number(body.ratePerGram),
        previousRate: existing?.ratePerGram || Number(body.ratePerGram),
        effectiveDate: dateStr,
        effectiveTime: timeStr,
        rateSource: 'Admin Manual Override / MCX Feed',
        notes: body.notes,
        updatedBy: body.updatedBy || 'Admin Owner',
        status: 'PUBLISHED',
        updatedAt: now.toISOString(),
      };

      await tx.metalRate.updateMany({
        where: { metal: body.metal, purity: body.purity, status: 'PUBLISHED' },
        data: { status: 'ROLLED_BACK' },
      });

      return tx.metalRate.create({ data: toMetalRateData(rate) });
    });

    res.status(201).json(toMetalRateResponse(saved as unknown as MetalRate));
  })
);

// Rollback Endpoint
ratesRouter.post(
  '/metal-rates/:id/rollback',
  requireRole('OWNER', 'FINANCE', 'PRODUCT_MANAGER'),
  asyncHandler(async (req, res) => {
    const target = await prisma.metalRate.findUnique({ where: { id: String(req.params.id) } });
    if (!target) throw new HttpError(404, 'Metal rate not found');

    const now = new Date();
    const rollback: MetalRate = {
      ...(target as unknown as MetalRate),
      id: generateSafeRateId(),
      ratePerGram: target.previousRate,
      previousRate: target.ratePerGram,
      status: 'PUBLISHED',
      updatedAt: now.toISOString(),
      notes: `Rollback from ${target.id}`,
    };

    const saved = await prisma.$transaction(async (tx) => {
      await tx.metalRate.updateMany({
        where: { metal: target.metal, purity: target.purity, status: 'PUBLISHED' },
        data: { status: 'ROLLED_BACK' },
      });
      return tx.metalRate.create({ data: toMetalRateData(rollback) });
    });

    res.status(201).json(toMetalRateResponse(saved as unknown as MetalRate));
  })
);

