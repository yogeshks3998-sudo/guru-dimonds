import { Router } from 'express';
import { prisma } from '../config/db';
import { asyncHandler, HttpError } from '../utils/http';
import { requireRole } from '../middleware/auth';

export const inquiriesRouter = Router();

// In-memory sliding window rate limiter for public inquiry submissions: max 5 requests per 10 minutes per IP
const submissionTracker = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const timestamps = (submissionTracker.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    throw new HttpError(429, 'Too many inquiry submissions. Please wait a few minutes before trying again.');
  }
  timestamps.push(now);
  submissionTracker.set(ip, timestamps);
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const toInquiryResponse = (inq: any) => ({
  id: inq.id,
  name: inq.name,
  contactNumber: inq.contactNumber,
  gmail: inq.gmail,
  requirement: inq.requirement,
  message: inq.message,
  status: inq.status,
  adminNotes: inq.adminNotes || undefined,
  assignedTo: inq.assignedTo || undefined,
  createdAt: inq.createdAt instanceof Date ? inq.createdAt.toISOString() : inq.createdAt,
  updatedAt: inq.updatedAt instanceof Date ? inq.updatedAt.toISOString() : inq.updatedAt,
});

// 1. POST /api/inquiries — Public submission
inquiriesRouter.post(
  '/inquiries',
  asyncHandler(async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    checkRateLimit(clientIp);

    const name = String(req.body.name || '').trim();
    const contactNumber = String(req.body.contactNumber || req.body.phone || '').trim();
    const gmail = String(req.body.gmail || req.body.email || '').trim().toLowerCase();
    const requirement = String(req.body.requirement || 'General Inquiry').trim();
    const message = String(req.body.message || '').trim();

    // Validation
    if (!name || name.length < 2) {
      throw new HttpError(400, 'Please provide your full name (minimum 2 characters)');
    }
    if (name.length > 100) {
      throw new HttpError(400, 'Name must not exceed 100 characters');
    }

    if (!contactNumber || contactNumber.length < 7) {
      throw new HttpError(400, 'Please provide a valid contact number (minimum 7 digits)');
    }
    if (contactNumber.length > 25) {
      throw new HttpError(400, 'Contact number must not exceed 25 characters');
    }

    if (!gmail || !EMAIL_REGEX.test(gmail)) {
      throw new HttpError(400, 'Please provide a valid email address');
    }
    if (gmail.length > 150) {
      throw new HttpError(400, 'Email address must not exceed 150 characters');
    }

    if (!requirement || requirement.length > 100) {
      throw new HttpError(400, 'Requirement category must be between 1 and 100 characters');
    }

    if (!message || message.length < 5) {
      throw new HttpError(400, 'Please provide a message or requirement details (minimum 5 characters)');
    }
    if (message.length > 3000) {
      throw new HttpError(400, 'Message must not exceed 3,000 characters');
    }

    // Persist to PostgreSQL; public clients cannot set status or internal notes
    const saved = await prisma.inquiry.create({
      data: {
        name,
        contactNumber,
        gmail,
        requirement,
        message,
        status: 'NEW',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. Our team will contact you shortly.',
      inquiry: toInquiryResponse(saved),
    });
  })
);

// 2. GET /api/inquiries — Admin inquiry listing
inquiriesRouter.get(
  '/inquiries',
  requireRole('OWNER', 'ORDER_MANAGER', 'CONTENT_MANAGER', 'STAFF', 'SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
    const skip = (page - 1) * limit;

    const statusFilter = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;

    const where: any = {};

    if (statusFilter && ['NEW', 'RESPONDED', 'ARCHIVED'].includes(statusFilter)) {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { gmail: { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search, mode: 'insensitive' } },
        { requirement: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    res.json({
      inquiries: inquiries.map(toInquiryResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
);

// 3. PATCH /api/inquiries/:id/status — Admin status & notes update
inquiriesRouter.patch(
  '/inquiries/:id/status',
  requireRole('OWNER', 'ORDER_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Inquiry not found');
    }

    const rawStatus = req.body.status ? String(req.body.status).toUpperCase() : existing.status;
    if (!['NEW', 'RESPONDED', 'ARCHIVED'].includes(rawStatus)) {
      throw new HttpError(400, `Invalid inquiry status: ${rawStatus}. Allowed values: NEW, RESPONDED, ARCHIVED`);
    }

    const adminNotes = req.body.adminNotes !== undefined ? (req.body.adminNotes ? String(req.body.adminNotes).trim() : null) : existing.adminNotes;
    const assignedTo = req.body.assignedTo !== undefined ? (req.body.assignedTo ? String(req.body.assignedTo).trim() : null) : existing.assignedTo;

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status: rawStatus,
        adminNotes,
        assignedTo,
      },
    });

    res.json(toInquiryResponse(updated));
  })
);

// 4. DELETE /api/inquiries/:id — Admin inquiry deletion
inquiriesRouter.delete(
  '/inquiries/:id',
  requireRole('OWNER', 'SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Inquiry not found');
    }

    await prisma.inquiry.delete({ where: { id } });
    res.status(204).send();
  })
);

