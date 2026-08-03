import { Router } from 'express';
import { prisma } from '../config/db';
import { requireRole } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

export const invoicesRouter = Router();

invoicesRouter.get(
  '/orders/:id/invoice',
  requireRole('OWNER', 'ORDER_MANAGER', 'FINANCE'),
  asyncHandler(async (req, res) => {
    const invoice = await prisma.invoice.findFirst({
      where: { order: { OR: [{ id: String(req.params.id) }, { orderNumber: String(req.params.id) }] } },
    });
    if (!invoice) throw new HttpError(404, 'Invoice not found');
    res.json(invoice);
  })
);

invoicesRouter.post(
  '/orders/:id/send-confirmation',
  requireRole('OWNER', 'ORDER_MANAGER'),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: String(req.params.id) }, { orderNumber: String(req.params.id) }] },
    });
    if (!order) throw new HttpError(404, 'Order not found');
    const customer = order.customerSnapshot as any;
    const log = await prisma.emailLog.create({
      data: {
        orderId: order.id,
        recipient: customer.email,
        subject: `Guru Diamonds order ${order.orderNumber} confirmation`,
        template: 'order_confirmation',
        status: 'QUEUED',
        provider: process.env.EMAIL_PROVIDER || 'log',
        payload: { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
      },
    });
    res.status(201).json(log);
  })
);
