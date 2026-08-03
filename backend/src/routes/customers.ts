import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toAddressData, toCustomerData } from '../utils/serializers';
import type { Customer } from '../../../src/types';
import { requireRole } from '../middleware/auth';

export const customersRouter = Router();

const toCustomerResponse = (customer: Customer): Customer =>
  ({
    ...customer,
    addresses: customer.addresses || [],
    tags: customer.tags || [],
    createdAt: new Date(customer.createdAt).toISOString(),
    lastOrderAt: customer.lastOrderAt ? new Date(customer.lastOrderAt).toISOString() : undefined,
  }) as Customer;

customersRouter.get(
  '/customers',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (_req, res) => {
    const customers = await prisma.customer.findMany({
      include: { addresses: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers.map((customer) => toCustomerResponse(customer as unknown as Customer)));
  })
);

customersRouter.get(
  '/customers/:id',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: String(req.params.id) },
      include: { addresses: true },
    });
    if (!customer) throw new HttpError(404, 'Customer not found');
    res.json(toCustomerResponse(customer as unknown as Customer));
  })
);

customersRouter.put(
  '/customers/:id',
  requireRole('OWNER'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const customer = { ...(req.body as Customer), id };
    const saved = await prisma.$transaction(async (tx) => {
      await tx.address.deleteMany({ where: { customerId: id } });
      return tx.customer.upsert({
        where: { id },
        create: {
          ...toCustomerData(customer),
          addresses: { create: customer.addresses.map((address) => toAddressData(address)) },
        },
        update: {
          ...toCustomerData(customer),
          addresses: { create: customer.addresses.map((address) => toAddressData(address)) },
        },
        include: { addresses: true },
      });
    });
    res.json(toCustomerResponse(saved as unknown as Customer));
  })
);
