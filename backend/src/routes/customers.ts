import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toAddressData, toCustomerData } from '../utils/serializers';
import type { Customer } from '../../../src/types';
import { requireRole } from '../middleware/auth';

export const customersRouter = Router();

const toCustomerResponse = (customer: any): Customer =>
  ({
    ...customer,
    addresses: customer.addresses || [],
    tags: customer.tags || [],
    createdAt: new Date(customer.createdAt).toISOString(),
    lastOrderAt: customer.lastOrderAt ? new Date(customer.lastOrderAt).toISOString() : undefined,
  }) as Customer;

customersRouter.get(
  '/customers',
  requireRole('OWNER', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'STAFF', 'FINANCE'),
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;

    const customers = await prisma.customer.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        addresses: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            orderStatus: true,
            placedAt: true,
          },
          orderBy: { placedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(customers.map((customer) => toCustomerResponse(customer)));
  })
);

customersRouter.get(
  '/customers/:id',
  requireRole('OWNER', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'STAFF'),
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: String(req.params.id) },
      include: {
        addresses: true,
        orders: {
          orderBy: { placedAt: 'desc' },
        },
      },
    });
    if (!customer) throw new HttpError(404, 'Customer not found');
    res.json(toCustomerResponse(customer));
  })
);

customersRouter.patch(
  '/customers/:id/status',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const status = String(req.body.status || 'ACTIVE');
    const tags = Array.isArray(req.body.tags) ? req.body.tags : undefined;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'Customer not found');

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        status,
        ...(tags ? { tags } : {}),
      },
      include: { addresses: true },
    });

    res.json(toCustomerResponse(updated));
  })
);

customersRouter.put(
  '/customers/:id',
  requireRole('OWNER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const customer = { ...(req.body as Customer), id };
    const saved = await prisma.customer.upsert({
      where: { id },
      create: {
        ...toCustomerData(customer),
        addresses: { create: (customer.addresses || []).map((address) => toAddressData(address)) },
      },
      update: {
        ...toCustomerData(customer),
        addresses: {
          deleteMany: {},
          create: (customer.addresses || []).map((address) => toAddressData(address)),
        },
      },
      include: { addresses: true },
    });
    res.json(toCustomerResponse(saved as unknown as Customer));
  })
);
