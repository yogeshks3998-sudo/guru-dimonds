import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router } from 'express';
import { prisma } from '../config/db';
import { requireAuth, signAuthToken } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';
import { toCustomerData } from '../utils/serializers';
import { sendOtpEmail } from '../utils/mailer';
import type { Customer } from '../../../src/types';

export const authRouter = Router();

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const otpExpiryMinutes = 10;
const maxOtpAttempts = 5;
const resendCooldownMs = 60_000;
const maxResendsPerHour = 5;

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
const otpExpiry = () => new Date(Date.now() + otpExpiryMinutes * 60_000);
const oneHourAgo = () => new Date(Date.now() - 60 * 60_000);
const normalizeIndianPhone = (phone: string) => {
  const compact = phone.replace(/[\s()-]/g, '');
  const digits = compact.startsWith('+') ? compact.slice(1) : compact;
  const withoutCountry = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;

  if (!/^[6-9]\d{9}$/.test(withoutCountry)) {
    throw new HttpError(400, 'Enter a valid Indian mobile number');
  }

  return `+91${withoutCountry}`;
};

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

const buildCustomerData = (params: { name: string; email: string; phone: string; passwordHash: string }) => {
  const now = new Date().toISOString();
  const customerData = toCustomerData({
    id: `cust-${Date.now()}`,
    name: params.name,
    email: params.email,
    phone: params.phone,
    addresses: [],
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    createdAt: now,
    tags: ['New Customer'],
    marketingConsent: true,
    status: 'ACTIVE',
  });

  return {
    ...customerData,
    passwordHash: params.passwordHash,
    emailVerified: true,
  };
};

const createPendingRegistration = async (params: { name: string; email: string; phone: string; password: string }) => {
  await prisma.pendingRegistration.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.customer.findUnique({ where: { email: params.email } }),
    prisma.customer.findFirst({ where: { phone: params.phone } }),
  ]);
  if (existingEmail) throw new HttpError(409, 'Customer account with this email already exists');
  if (existingPhone) throw new HttpError(409, 'Mobile number is already registered');

  const passwordHash = await bcrypt.hash(params.password, 12);
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 12);
  const now = new Date();
  const expiresAt = otpExpiry();

  await prisma.pendingRegistration.upsert({
    where: { phone: params.phone },
    create: {
      email: params.email,
      name: params.name,
      phone: params.phone,
      passwordHash,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: 0,
      resendWindowStart: now,
      lastSentAt: now,
    },
    update: {
      email: params.email,
      name: params.name,
      phone: params.phone,
      passwordHash,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: 0,
      resendWindowStart: now,
      lastSentAt: now,
    },
  });

  try {
    await sendOtpEmail({ email: params.email, name: params.name, otp });
  } catch (error) {
    await prisma.pendingRegistration.deleteMany({ where: { phone: params.phone } });
    throw error;
  }
};

authRouter.post(
  '/auth/customer/register',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const rawPhone = String(req.body.phone || '').trim();
    const phone = normalizeIndianPhone(rawPhone);
    const rawEmail = String(req.body.email || '').trim();
    const email = rawEmail ? normalizeEmail(rawEmail) : `${phone.replace(/\D/g, '')}@customer.gurudiamonds.internal`;
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || req.body.password || '');

    if (!name) {
      throw new HttpError(400, 'Please enter your full name');
    }
    if (!rawPhone) {
      throw new HttpError(400, 'Please enter a valid 10-digit mobile number');
    }
    if (rawEmail && !validEmail(rawEmail)) {
      throw new HttpError(400, 'Please enter a valid email address');
    }
    if (!password || password.length < 6) {
      throw new HttpError(400, 'Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      throw new HttpError(400, 'Passwords do not match');
    }

    // Check if mobile or email already exists in database
    const [existingPhone, existingEmail] = await Promise.all([
      prisma.customer.findFirst({
        where: {
          OR: [
            { phone },
            { phone: phone.replace(/^\+91/, '') },
          ],
        },
      }),
      rawEmail ? prisma.customer.findUnique({ where: { email } }) : null,
    ]);

    if (existingPhone) {
      throw new HttpError(409, 'This mobile number is already registered. Please sign in with your password.');
    }
    if (existingEmail) {
      throw new HttpError(409, 'An account with this email address already exists. Please sign in with your password.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: buildCustomerData({
        name,
        email,
        phone,
        passwordHash,
      }),
      include: { addresses: true },
    });

    const token = signAuthToken({ sub: customer.id, type: 'CUSTOMER', email: customer.email });
    res.status(201).json({
      success: true,
      token,
      customer: publicCustomer(customer),
      message: 'Account created successfully! Welcome to Guru Diamonds.',
    });
  })
);

authRouter.post(
  '/auth/customer/verify-otp',
  asyncHandler(async (req, res) => {
    const email = req.body.email ? normalizeEmail(String(req.body.email)) : undefined;
    const phone = req.body.phone ? normalizeIndianPhone(String(req.body.phone)) : undefined;
    const otp = String(req.body.otp || '').trim();

    if (!/^\d{6}$/.test(otp)) throw new HttpError(400, 'Enter the 6 digit verification code');
    if (!email && !phone) throw new HttpError(400, 'Email or mobile number is required');

    const pending = await prisma.pendingRegistration.findFirst({
      where: email ? { email } : { phone },
    });
    if (!pending) throw new HttpError(400, 'Verification code is invalid or expired');
    if (pending.expiresAt < new Date()) {
      await prisma.pendingRegistration.deleteMany({ where: { phone: pending.phone } });
      throw new HttpError(400, 'Verification code has expired. Please request a new code.');
    }
    if (pending.attempts >= maxOtpAttempts) {
      await prisma.pendingRegistration.deleteMany({ where: { phone: pending.phone } });
      throw new HttpError(429, 'Too many incorrect attempts. Please request a new verification code.');
    }

    const matches = await bcrypt.compare(otp, pending.otpHash);
    if (!matches) {
      const attempts = pending.attempts + 1;
      if (attempts >= maxOtpAttempts) {
        await prisma.pendingRegistration.deleteMany({ where: { phone: pending.phone } });
        throw new HttpError(429, 'Too many incorrect attempts. Please request a new verification code.');
      }
      await prisma.pendingRegistration.update({ where: { phone: pending.phone }, data: { attempts } });
      throw new HttpError(400, 'Invalid verification code');
    }

    const [existingEmail, existingPhone] = await Promise.all([
      prisma.customer.findUnique({ where: { email: pending.email } }),
      prisma.customer.findFirst({ where: { phone: pending.phone } }),
    ]);
    if (existingEmail || existingPhone) {
      await prisma.pendingRegistration.deleteMany({ where: { phone: pending.phone } });
      throw new HttpError(409, 'Customer already exists');
    }

    const customer = await prisma.customer.create({
      data: buildCustomerData({
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        passwordHash: pending.passwordHash,
      }),
      include: { addresses: true },
    });
    await prisma.pendingRegistration.deleteMany({ where: { phone: pending.phone } });

    const token = signAuthToken({ sub: customer.id, type: 'CUSTOMER', email: customer.email });
    res.status(201).json({ token, customer: publicCustomer(customer) });
  })
);

authRouter.post(
  '/auth/customer/resend-otp',
  asyncHandler(async (req, res) => {
    const email = req.body.email ? normalizeEmail(String(req.body.email)) : undefined;
    const phone = req.body.phone ? normalizeIndianPhone(String(req.body.phone)) : undefined;

    if (!email && !phone) throw new HttpError(400, 'Email or mobile number is required');

    const pending = await prisma.pendingRegistration.findFirst({
      where: email ? { email } : { phone },
    });
    if (!pending) {
      throw new HttpError(400, 'Please start registration again');
    }

    const now = new Date();
    if (now.getTime() - pending.lastSentAt.getTime() < resendCooldownMs) {
      throw new HttpError(429, 'Please wait before requesting a new verification code.');
    }

    const resetWindow = pending.resendWindowStart < oneHourAgo();
    const resendCount = resetWindow ? 0 : pending.resendCount;
    if (resendCount >= maxResendsPerHour) {
      throw new HttpError(429, 'Too many verification codes requested. Please try again later.');
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = otpExpiry();

    await prisma.pendingRegistration.update({
      where: { phone: pending.phone },
      data: {
        otpHash,
        expiresAt,
        attempts: 0,
        resendCount: resendCount + 1,
        resendWindowStart: resetWindow ? now : pending.resendWindowStart,
        lastSentAt: now,
      },
    });

    try {
      await sendOtpEmail({ email: pending.email, name: pending.name, otp });
    } catch (error) {
      await prisma.pendingRegistration.update({
        where: { phone: pending.phone },
        data: {
          otpHash: pending.otpHash,
          expiresAt: pending.expiresAt,
          attempts: pending.attempts,
          resendCount: pending.resendCount,
          resendWindowStart: pending.resendWindowStart,
          lastSentAt: pending.lastSentAt,
        },
      });
      throw error;
    }

    res.json({ success: true, message: `A new verification code has been sent to ${pending.email}` });
  })
);

authRouter.post(
  '/auth/customer/login',
  asyncHandler(async (req, res) => {
    const identifier = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
    const password = String(req.body.password || '');

    if (!identifier) {
      throw new HttpError(400, 'Please enter your mobile number or email');
    }
    if (!password) {
      throw new HttpError(400, 'Please enter your password');
    }

    const cleanLower = identifier.toLowerCase();
    const digits = identifier.replace(/\D/g, '');
    const tenDigits = digits.slice(-10);

    // Search by email or multiple phone representations
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: cleanLower },
          { phone: identifier },
          { phone: `+91${tenDigits}` },
          { phone: tenDigits },
        ],
      },
      include: { addresses: true },
    });

    if (!customer?.passwordHash || !(await bcrypt.compare(password, customer.passwordHash))) {
      throw new HttpError(401, 'Invalid mobile number/email or password');
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
