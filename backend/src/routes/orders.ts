import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toAddressData, toCustomerData, toOrderCreateData, toOrderResponse } from '../utils/serializers';
import type { Customer, Order } from '../../../src/types';
import { requireRole } from '../middleware/auth';

export const ordersRouter = Router();

const orderInclude = {
  items: true,
  history: { orderBy: { timestamp: 'asc' as const } },
};

ordersRouter.get(
  '/orders',
  requireRole('OWNER', 'ORDER_MANAGER', 'FINANCE'),
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      include: orderInclude,
      orderBy: { placedAt: 'desc' },
    });
    res.json(orders.map((order) => toOrderResponse(order as unknown as Order)));
  })
);

ordersRouter.get(
  '/orders/:id',
  requireRole('OWNER', 'ORDER_MANAGER', 'FINANCE'),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: String(req.params.id) }, { orderNumber: String(req.params.id) }] },
      include: orderInclude,
    });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(toOrderResponse(order as unknown as Order));
  })
);

ordersRouter.post(
  '/orders',
  asyncHandler(async (req, res) => {
    const order = req.body as Order;
    const saved = await prisma.$transaction(async (tx) => {
      const customer: Customer = {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        addresses: [order.shippingAddress],
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        createdAt: order.placedAt,
        tags: [],
        marketingConsent: true,
        status: 'ACTIVE',
      };

      await tx.customer.upsert({
        where: { id: customer.id },
        create: {
          ...toCustomerData(customer),
          totalOrders: 1,
          totalSpent: order.totalAmount,
          averageOrderValue: order.totalAmount,
          lastOrderAt: new Date(order.placedAt),
          addresses: { create: customer.addresses.map((address) => toAddressData(address)) },
        },
        update: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.totalAmount },
          lastOrderAt: new Date(order.placedAt),
        },
      });

      return tx.order.create({
        data: {
          ...toOrderCreateData(order),
          items: { create: order.items as any },
          history: {
            create: order.history.map((step) => ({
              status: step.status,
              timestamp: new Date(step.timestamp),
              note: step.note,
              updatedBy: step.updatedBy,
            })),
          },
        },
        include: orderInclude,
      });
    });

    res.status(201).json(toOrderResponse(saved as unknown as Order));
  })
);

ordersRouter.patch(
  '/orders/:id/status',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const status = String(req.body.status || '');
    const note = String(req.body.note || `Status updated to ${status}`);
    const updatedBy = String(req.body.updatedBy || 'Admin User');

    const saved = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: {
        orderStatus: status,
        history: {
          create: {
            status,
            timestamp: new Date(),
            note,
            updatedBy,
          },
        },
      },
      include: orderInclude,
    });
    res.json(toOrderResponse(saved as unknown as Order));
  })
);
