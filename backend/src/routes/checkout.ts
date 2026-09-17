import { Router } from 'express';
import { prisma, transactionOptions } from '../config/db';
import { requireCustomer } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { buildCheckoutInputFromCart, buildOrderFromCheckout, calculateCheckout, CheckoutInput } from '../utils/checkout';
import { toAddressData, toOrderCreateData, toOrderResponse } from '../utils/serializers';
import { sendOrderConfirmationEmail } from '../utils/mailer';
import type { Order } from '../../../src/types';

export const checkoutRouter = Router();

const orderInclude = {
  items: true,
  history: { orderBy: { timestamp: 'asc' as const } },
  payments: true,
  invoice: true,
};

export const decrementInventory = async (tx: any, order: Order) => {
  for (const item of order.items) {
    if (item.variantId) {
      const variantUpdate = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (variantUpdate.count !== 1) throw new HttpError(409, `Insufficient stock for ${item.productName}`);
    }

    const productUpdate = await tx.product.updateMany({
      where: { id: item.productId, totalStock: { gte: item.quantity } },
      data: { totalStock: { decrement: item.quantity } },
    });
    if (productUpdate.count !== 1) throw new HttpError(409, `Insufficient stock for ${item.productName}`);

    await tx.inventoryItem.updateMany({
      where: { productId: item.productId, ...(item.variantId ? { variantId: item.variantId } : {}), quantity: { gte: item.quantity } },
      data: { quantity: { decrement: item.quantity } },
    });
  }
};

export const createInvoiceAndEmailLog = async (tx: any, order: Order, gstNumber?: string) => {
  await tx.invoice.create({
    data: {
      orderId: order.id,
      invoiceNumber: order.gstInvoiceNumber || `INV-${order.orderNumber}`,
      gstNumber,
      invoiceData: order as any,
    },
  });

  // Dispatch real luxury HTML order confirmation email asynchronously
  void sendOrderConfirmationEmail(order).catch((err) => {
    console.error(`Order confirmation email failed for #${order.orderNumber}:`, err);
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
    const customer = await prisma.customer.findUnique({ where: { id: req.auth!.sub }, include: { addresses: true } });
    if (!customer || customer.status !== 'ACTIVE') throw new HttpError(403, 'Customer account is not active');

    const trustedInput = await buildCheckoutInputFromCart(prisma, customer.id, input);
    if (trustedInput.paymentMethod !== 'COD') {
      throw new HttpError(400, 'Use Razorpay payment order endpoint for prepaid checkout');
    }
    const totals = await calculateCheckout(prisma, trustedInput);
    const order = buildOrderFromCheckout(
      { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
      trustedInput,
      totals
    );

    const saved = await prisma.$transaction(async (tx: any) => {
      const currentCustomer = await tx.customer.findUnique({ where: { id: customer.id }, include: { addresses: true } });
      const customerAddresses = currentCustomer?.addresses || customer.addresses || [];
      if (!currentCustomer || currentCustomer.status !== 'ACTIVE') throw new HttpError(403, 'Customer account is not active');

      await decrementInventory(tx, order);
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.totalAmount },
          lastOrderAt: new Date(order.placedAt),
          addresses: customerAddresses.some((address: any) => address.id === order.shippingAddress.id)
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
              provider: trustedInput.paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
              amount: order.totalAmount,
              status: trustedInput.paymentMethod === 'COD' ? 'PENDING' : 'CREATED',
              method: trustedInput.paymentMethod,
              rawPayload: { scaffold: true },
            },
          },
        },
        include: orderInclude,
      });

      return created;
    }, transactionOptions);

    // Invoicing, email notifications, and cart cleanup execute after order creation commits
    await createInvoiceAndEmailLog(prisma, order, input.gstNumber).catch((err) => {
      console.warn(`Invoice generation notice for #${order.orderNumber}:`, err);
    });

    const cart = await prisma.cart.findUnique({ where: { customerId: customer.id } }).catch(() => null);
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } }).catch(() => {});

    res.status(201).json(toOrderResponse(saved));
  })
);
