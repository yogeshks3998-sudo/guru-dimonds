import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { toAddressData, toCustomerData, toOrderCreateData, toOrderResponse } from '../utils/serializers';
import type { Customer, Order } from '../../../src/types';
import { requireRole, requireCustomer, extractAuthToken } from '../middleware/auth';
import { canTransitionOrderStatus } from '../../../src/utils/orderLifecycle';
import type { OrderStatus } from '../../../src/types';

import { sendOrderStatusEmail } from '../utils/mailer';

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
  '/orders/my-orders',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const customerId = req.auth!.sub;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        include: orderInclude,
        orderBy: { placedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { customerId } }),
    ]);

    res.json({
      orders: orders.map((order) => toOrderResponse(order as unknown as Order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

ordersRouter.get(
  '/orders/:id',
  asyncHandler(async (req, res) => {
    const auth = extractAuthToken(req);
    if (!auth) {
      throw new HttpError(401, 'Authentication required');
    }

    const id = String(req.params.id);
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: orderInclude,
    });
    if (!order) throw new HttpError(404, 'Order not found');

    const isAdmin = auth.type === 'ADMIN' && ['OWNER', 'ORDER_MANAGER', 'FINANCE', 'SUPER_ADMIN'].includes(auth.role || '');
    if (!isAdmin) {
      if (auth.type !== 'CUSTOMER' || order.customerId !== auth.sub) {
        throw new HttpError(403, 'You do not have permission to view this order');
      }
    }

    res.json(toOrderResponse(order as unknown as Order));
  })
);

ordersRouter.post(
  '/orders',
  asyncHandler(async (req, res) => {
    const order = req.body as Order;
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

    await prisma.customer.upsert({
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

    const saved = await prisma.order.create({
      data: {
        ...toOrderCreateData(order),
        items: {
          create: (order.items || []).map(({ orderId: _orderId, ...item }: any) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.productName,
            variantSku: item.variantSku || null,
            variantDetails: item.variantDetails || null,
            image: item.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            priceBreakdownSnapshot: item.priceBreakdownSnapshot,
            customEngraving: item.customEngraving || null,
          })),
        },
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
    const trackingNumber = req.body.trackingNumber ? String(req.body.trackingNumber) : undefined;
    const courierPartner = req.body.courierPartner ? String(req.body.courierPartner) : undefined;

    const existing = await prisma.order.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new HttpError(404, 'Order not found');
    if (!canTransitionOrderStatus(existing.orderStatus as OrderStatus, status as OrderStatus)) {
      throw new HttpError(400, `Cannot transition order from ${existing.orderStatus} to ${status}`);
    }

    if (status === 'CANCELLED' && existing.orderStatus !== 'CANCELLED' && existing.paymentStatus === 'PAID') {
      const fullOrder = await prisma.order.findUnique({ where: { id: existing.id }, include: { items: true } });
      if (fullOrder?.items) {
        for (const item of fullOrder.items) {
          if (item.variantId) {
            await prisma.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await prisma.product.updateMany({
            where: { id: item.productId },
            data: { totalStock: { increment: item.quantity } },
          });
          await prisma.inventoryItem.updateMany({
            where: { productId: item.productId, ...(item.variantId ? { variantId: item.variantId } : {}) },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    const saved = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: {
        orderStatus: status,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(courierPartner ? { courierPartner } : {}),
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

    const responseOrder = toOrderResponse(saved as unknown as Order) as Order;
    void sendOrderStatusEmail({
      order: responseOrder,
      status,
      note,
      trackingNumber: trackingNumber || responseOrder.trackingNumber,
      courierPartner: courierPartner || responseOrder.courierPartner,
    }).catch(console.error);

    res.json(responseOrder);
  })
);
