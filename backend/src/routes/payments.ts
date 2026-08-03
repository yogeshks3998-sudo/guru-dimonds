import crypto from 'crypto';
import { Router } from 'express';
import { prisma } from '../config/db';
import { requireCustomer } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

export const paymentsRouter = Router();

const makeProviderOrderId = () => `rzp_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

paymentsRouter.post(
  '/payments/razorpay/create-order',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const amount = Math.round(Number(req.body.amount || 0));
    if (amount <= 0) throw new HttpError(400, 'Payment amount is required');
    const payment = await prisma.payment.create({
      data: {
        provider: 'RAZORPAY',
        providerOrderId: makeProviderOrderId(),
        amount,
        currency: 'INR',
        status: 'CREATED',
        method: req.body.method || null,
        rawPayload: {
          keyIdConfigured: Boolean(process.env.RAZORPAY_KEY_ID),
          localScaffold: true,
        },
      },
    });
    res.status(201).json({
      provider: payment.provider,
      providerOrderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: process.env.RAZORPAY_KEY_ID || null,
      scaffold: true,
    });
  })
);

paymentsRouter.post(
  '/payments/razorpay/verify',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const providerOrderId = String(req.body.razorpay_order_id || req.body.providerOrderId || '');
    const providerPaymentId = String(req.body.razorpay_payment_id || req.body.providerPaymentId || '');
    const signature = String(req.body.razorpay_signature || req.body.signature || '');

    if (!providerOrderId || !providerPaymentId) throw new HttpError(400, 'Payment verification payload is incomplete');

    let verified = true;
    if (process.env.RAZORPAY_KEY_SECRET && signature) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest('hex');
      verified = expected === signature;
    }

    const payment = await prisma.payment.updateMany({
      where: { providerOrderId },
      data: {
        providerPaymentId,
        providerSignature: signature || null,
        status: verified ? 'VERIFIED' : 'FAILED',
        rawPayload: req.body,
      },
    });

    if (!verified) throw new HttpError(400, 'Payment signature verification failed');
    res.json({ success: true, updated: payment.count });
  })
);

paymentsRouter.post(
  '/payments/webhook/razorpay',
  asyncHandler(async (req, res) => {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (process.env.RAZORPAY_WEBHOOK_SECRET && signature) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (expected !== signature) throw new HttpError(400, 'Invalid webhook signature');
    }

    await prisma.emailLog.create({
      data: {
        recipient: process.env.FROM_EMAIL || 'orders@vedaara.com',
        subject: 'Razorpay webhook received',
        template: 'razorpay_webhook',
        status: 'RECEIVED',
        provider: 'RAZORPAY',
        payload: req.body,
      },
    });
    res.json({ received: true });
  })
);

