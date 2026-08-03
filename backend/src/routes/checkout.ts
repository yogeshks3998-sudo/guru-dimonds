import { Router } from 'express';
import { prisma } from '../config/db';
import { requireCustomer } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { buildOrderFromCheckout, calculateCheckout, CheckoutInput } from '../utils/checkout';
import { toAddressData, toOrderCreateData, toOrderResponse } from '../utils/serializers';
import type { Order } from '../../../src/types';

export const checkoutRouter = Router();

const orderInclude = {
  items: true,
  history: { orderBy: { timestamp: 'asc' as const } },
  payments: true,
  invoice: true,
};

const decrementInventory = async (tx: any, order: Order) => {
  for (const item of order.items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stock < item.quantity) throw new HttpError(409, `Insufficient stock for ${item.productName}`);
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
    }
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.totalStock < item.quantity) throw new HttpError(409, `Insufficient stock for ${item.productName}`);
    await tx.product.update({ where: { id: item.productId }, data: { totalStock: { decrement: item.quantity } } });
    await tx.inventoryItem.updateMany({
      where: { productId: item.productId, ...(item.variantId ? { variantId: item.variantId } : {}) },
      data: { quantity: { decrement: item.quantity } },
    });
  }
};

const createInvoiceAndEmailLog = async (tx: any, order: Order, gstNumber?: string) => {
  await tx.invoice.create({
    data: {
      orderId: order.id,
      invoiceNumber: order.gstInvoiceNumber || `INV-${order.orderNumber}`,
      gstNumber,
      invoiceData: order as any,
    },
  });
  await tx.emailLog.create({
    data: {
      orderId: order.id,
      recipient: order.customer.email,
      subject: `Vedaara order ${order.orderNumber} received`,
      template: 'order_confirmation',
      status: 'QUEUED',
      provider: process.env.EMAIL_PROVIDER || 'log',
      payload: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
    },
  });
};

checkoutRouter.post(
  '/checkout/validate',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const totals = await calculateCheckout(prisma, req.body as CheckoutInput);
    res.json({ success: true, ...totals });
  })
);

checkoutRouter.post(
  '/checkout/create-order',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const input = req.body as CheckoutInput;
    const saved = await prisma.$transaction(async (tx: any) => {
      const customer = await tx.customer.findUnique({ where: { id: req.auth!.sub }, include: { addresses: true } });
      if (!customer || customer.status !== 'ACTIVE') throw new HttpError(403, 'Customer account is not active');
      const totals = await calculateCheckout(tx, input);
      const order = buildOrderFromCheckout(
        { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
        input,
        totals
      );

      await decrementInventory(tx, order);
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.totalAmount },
          lastOrderAt: new Date(order.placedAt),
          addresses: customer.addresses.some((address: any) => address.id === order.shippingAddress.id)
            ? undefined
            : { create: [toAddressData(order.shippingAddress)] },
        },
      });

      const created = await tx.order.create({
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
          payments: {
            create: {
              provider: input.paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
              amount: order.totalAmount,
              status: input.paymentMethod === 'COD' ? 'PENDING' : 'CREATED',
              method: input.paymentMethod,
              rawPayload: { scaffold: true },
            },
          },
        },
        include: orderInclude,
      });

      await createInvoiceAndEmailLog(tx, order, input.gstNumber);
      const cart = await tx.cart.findUnique({ where: { customerId: customer.id } });
      if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    res.status(201).json(toOrderResponse(saved));
  })
);

