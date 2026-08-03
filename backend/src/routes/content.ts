import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toCMSData, toCMSResponse } from '../utils/serializers';
import type { CMSContent } from '../../../src/types';
import { requireRole } from '../middleware/auth';

export const contentRouter = Router();

contentRouter.get(
  '/cms',
  asyncHandler(async (_req, res) => {
    const cms = await prisma.cMSContent.findUnique({ where: { id: 'default' } });
    if (!cms) throw new HttpError(404, 'CMS content has not been seeded');
    res.json(toCMSResponse(cms));
  })
);

contentRouter.put(
  '/cms',
  requireRole('OWNER', 'CONTENT_MANAGER'),
  asyncHandler(async (req, res) => {
    const cms = req.body as CMSContent;
    const saved = await prisma.cMSContent.upsert({
      where: { id: 'default' },
      create: toCMSData(cms),
      update: toCMSData(cms),
    });
    res.json(toCMSResponse(saved));
  })
);
