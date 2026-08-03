import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { prisma } from '../config/db';
import { requireAuth, signAuthToken } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { toAddressData, toCustomerData } from '../utils/serializers';
import type { Customer } from '../../../src/types';

export const authRouter = Router();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const publicCustomer = (customer: any): Customer => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  avatar: customer.avatar,
  addresses: customer.addresses || [],
  totalOrders: customer.totalOrders,
  totalSpent: customer.totalSpent,
  averageOrderValue: customer.averageOrderValue,
  createdAt: new Date(customer.createdAt).toISOString(),
  lastOrderAt: customer.lastOrderAt ? new Date(customer.lastOrderAt).toISOString() : undefined,
  tags: customer.tags || [],
  marketingConsent: customer.marketingConsent,
  status: customer.status,
});

const publicAdmin = (admin: any) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  avatar: admin.avatar,
  active: admin.active,
  lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toISOString() : new Date().toISOString(),
});

authRouter.post(
  '/auth/customer/register',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(String(req.body.email || ''));
    const password = String(req.body.password || '');
    const name = String(req.body.name || email.split('@')[0]);
    const phone = String(req.body.phone || '+91 98000 00000');

    if (!email || !password || password.length < 8) {
      throw new HttpError(400, 'Email and an 8 character password are required');
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, 'Customer already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();
    const customerData = toCustomerData({
      id: `cust-${Date.now()}`,
      name,
      email,
      phone,
      addresses: [],
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      createdAt: now,
      tags: ['New Customer'],
      marketingConsent: true,
      status: 'ACTIVE',
    });

    const customer = await prisma.customer.create({
      data: { ...customerData, passwordHash, emailVerified: false },
      include: { addresses: true },
    });

    const token = signAuthToken({ sub: customer.id, type: 'CUSTOMER', email: customer.email });
    res.status(201).json({ token, customer: publicCustomer(customer) });
  })
);

authRouter.post(
  '/auth/customer/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(String(req.body.email || ''));
    const password = String(req.body.password || '');
    const customer = await prisma.customer.findUnique({ where: { email }, include: { addresses: true } });

    if (!customer?.passwordHash || !(await bcrypt.compare(password, customer.passwordHash))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    if (customer.status !== 'ACTIVE') throw new HttpError(403, 'Customer account is not active');

    const saved = await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
      include: { addresses: true },
    });
    const token = signAuthToken({ sub: saved.id, type: 'CUSTOMER', email: saved.email });
    res.json({ token, customer: publicCustomer(saved) });
  })
);

authRouter.post(
  '/auth/admin/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(String(req.body.email || req.body.username || ''));
    const password = String(req.body.password || '');
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin?.passwordHash || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new HttpError(401, 'Invalid admin credentials');
    }

    if (!admin.active) throw new HttpError(403, 'Admin account is inactive');

    const saved = await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });
    const token = signAuthToken({ sub: saved.id, type: 'ADMIN', role: saved.role, email: saved.email });
    res.json({ token, adminUser: publicAdmin(saved) });
  })
);

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.auth?.type === 'ADMIN') {
      const admin = await prisma.adminUser.findUnique({ where: { id: req.auth.sub } });
      if (!admin || !admin.active) throw new HttpError(401, 'Admin session is no longer valid');
      res.json({ type: 'ADMIN', adminUser: publicAdmin(admin) });
      return;
    }

    const customer = await prisma.customer.findUnique({ where: { id: req.auth!.sub }, include: { addresses: true } });
    if (!customer || customer.status !== 'ACTIVE') throw new HttpError(401, 'Customer session is no longer valid');
    res.json({ type: 'CUSTOMER', customer: publicCustomer(customer) });
  })
);

authRouter.post('/auth/logout', (_req, res) => {
  res.status(204).send();
});

