import crypto from 'crypto';
import { Router } from 'express';
import Razorpay from 'razorpay';
import { env } from '../config/env';
import { prisma, transactionOptions } from '../config/db';
import { requireCustomer } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { toOrderCreateData, toOrderResponse } from '../utils/serializers';
import { buildCheckoutInputFromCart, buildOrderFromCheckout, calculateCheckout, CheckoutInput } from '../utils/checkout';
import { createInvoiceAndEmailLog, decrementInventory } from './checkout';
import type { Order } from '../../../src/types';

export const paymentsRouter = Router();

const orderInclude = {
  items: true,
  history: { orderBy: { timestamp: 'asc' as const } },
  payments: true,
  invoice: true,
};

const getRazorpayClient = () => {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new HttpError(500, 'Razorpay credentials are not configured');
  }
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
};

const toPaise = (amount: number) => Math.round(amount * 100);

const verifyPaymentSignature = (razorpayOrderId: string, razorpayPaymentId: string, signature: string) => {
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

const markOrderPaid = async (
  tx: any,
  order: any,
  payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    rawPayload: unknown;
    method?: string;
  }
) => {
  if (order.paymentStatus === 'PAID') return order;

  await decrementInventory(tx, toOrderResponse(order) as Order);

  await tx.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      history: {
        create: {
          status: 'CONFIRMED',
          timestamp: new Date(),
          note: 'Razorpay payment verified.',
          updatedBy: 'Razorpay',
        },
      },
    },
  });

  await tx.payment.updateMany({
    where: { orderId: order.id, provider: 'RAZORPAY', providerOrderId: payload.razorpayOrderId },
    data: {
      providerPaymentId: payload.razorpayPaymentId,
      providerSignature: payload.razorpaySignature || null,
      status: 'PAID',
      method: payload.method || order.paymentMethod,
      rawPayload: payload.rawPayload as any,
      paidAt: new Date(),
    },
  });

  await tx.customer.update({
    where: { id: order.customerId },
    data: {
      totalOrders: { increment: 1 },
      totalSpent: { increment: order.totalAmount },
      lastOrderAt: new Date(order.placedAt),
    },
  });

  const cart = await tx.cart.findUnique({ where: { customerId: order.customerId } });
  if (cart) {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
  }

  await createInvoiceAndEmailLog(tx, toOrderResponse(order) as Order, undefined);

  return tx.order.findUnique({ where: { id: order.id }, include: orderInclude });
};

paymentsRouter.post(
  '/payments/razorpay/create-order',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const input = req.body as CheckoutInput;
    const clientRequestId = String((req.body as any).clientRequestId || '');
    if (input.paymentMethod === 'COD') throw new HttpError(400, 'COD orders do not use Razorpay');

    const customer = await prisma.customer.findUnique({ where: { id: req.auth!.sub }, include: { addresses: true } });
    if (!customer || customer.status !== 'ACTIVE') throw new HttpError(403, 'Customer account is not active');

    const trustedInput = await buildCheckoutInputFromCart(prisma, customer.id, input);
    const totals = await calculateCheckout(prisma, trustedInput);
    const order = buildOrderFromCheckout(
      { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
      trustedInput,
      totals
    );

    const razorpay = getRazorpayClient();
    const amount = toPaise(totals.totalAmount);
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        internalOrderId: order.id,
        customerId: customer.id,
      },
    });

    const saved = await prisma.order.create({
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
            provider: 'RAZORPAY',
            providerOrderId: razorpayOrder.id,
            amount: order.totalAmount,
            currency: 'INR',
            status: 'CREATED',
            method: trustedInput.paymentMethod,
            rawPayload: {
              razorpayOrderId: razorpayOrder.id,
              amount,
              currency: 'INR',
              clientRequestId,
            },
          },
        },
      },
      include: orderInclude,
    });

    res.status(201).json({
      keyId: env.razorpayKeyId,
      orderId: saved.id,
      orderNumber: saved.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount,
      displayAmount: saved.totalAmount,
      currency: 'INR',
      customer: saved.customerSnapshot,
      description: `Guru Diamonds order ${saved.orderNumber}`,
    });
  })
);

paymentsRouter.post(
  '/payments/razorpay/verify',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const razorpayOrderId = String(req.body.razorpay_order_id || '');
    const razorpayPaymentId = String(req.body.razorpay_payment_id || '');
    const razorpaySignature = String(req.body.razorpay_signature || '');
    const orderId = String(req.body.orderId || '');

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      throw new HttpError(400, 'Payment verification payload is incomplete');
    }
    if (!env.razorpayKeySecret) throw new HttpError(500, 'Razorpay signature verification is not configured');
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      await prisma.payment.updateMany({
        where: { providerOrderId: razorpayOrderId },
        data: { status: 'FAILED', rawPayload: req.body as any },
      });
      throw new HttpError(400, 'Payment signature verification failed');
    }

    const saved = await prisma.$transaction(async (tx: any) => {
      const duplicate = await tx.payment.findFirst({
        where: {
          provider: 'RAZORPAY',
          providerPaymentId: razorpayPaymentId,
          NOT: { orderId },
        },
      });
      if (duplicate) throw new HttpError(409, 'Payment has already been used for another order');

      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          customerId: req.auth!.sub,
          payments: { some: { provider: 'RAZORPAY', providerOrderId: razorpayOrderId } },
        },
        include: orderInclude,
      });
      if (!order) throw new HttpError(404, 'Payment order not found');

      if (order.paymentStatus === 'PAID') {
        return order;
      }

      return markOrderPaid(tx, order, {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        rawPayload: req.body,
        method: req.body.method ? String(req.body.method) : undefined,
      });
    }, transactionOptions);

    res.json({ success: true, order: toOrderResponse(saved) });
  })
);

paymentsRouter.post(
  '/payments/webhook/razorpay',
  asyncHandler(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (env.razorpayWebhookSecret) {
      const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex');
      if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
        throw new HttpError(400, 'Invalid webhook signature');
      }
    }

    const body = JSON.parse(rawBody.toString('utf8'));
    const event = String(body.event || '');
    const paymentEntity = body.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id ? String(paymentEntity.order_id) : '';
    const razorpayPaymentId = paymentEntity?.id ? String(paymentEntity.id) : '';

    if (event === 'payment.captured' && razorpayOrderId && razorpayPaymentId) {
      await prisma.$transaction(async (tx: any) => {
        const order = await tx.order.findFirst({
          where: { payments: { some: { provider: 'RAZORPAY', providerOrderId: razorpayOrderId } } },
          include: orderInclude,
        });
        if (order && order.paymentStatus !== 'PAID') {
          await tx.payment.updateMany({
            where: { orderId: order.id, providerOrderId: razorpayOrderId },
            data: {
              providerPaymentId: razorpayPaymentId,
              status: 'CAPTURED',
              method: paymentEntity.method || order.paymentMethod,
              rawPayload: body,
            },
          });
        }
      }, transactionOptions);
    }

    await prisma.emailLog.create({
      data: {
        recipient: process.env.FROM_EMAIL || 'info@gurudimonds.in',
        subject: 'Razorpay webhook received',
        template: 'razorpay_webhook',
        status: 'RECEIVED',
        provider: 'RAZORPAY',
        payload: { event, razorpayOrderId, razorpayPaymentId },
      },
    });
    res.json({ received: true });
  })
);
