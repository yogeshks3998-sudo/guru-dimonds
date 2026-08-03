import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../utils/http';

export const healthRouter = Router();

healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'vedaara-api' });
  })
);

