/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { authHeader, tokenFor } from '../helpers/auth';
import { customerFactory, orderFactory, productFactory, uniqueId } from '../helpers/factories';
import { prisma } from '../../backend/src/config/db';
import { cleanupOrder } from '../helpers/db';
import { toCustomerData } from '../../backend/src/utils/serializers';

describe('Stage 3: Functional Integration & End-to-End Persistence', () => {
  const ownerAuth = authHeader(tokenFor({ role: 'OWNER' }));
  const customerAuth = authHeader(tokenFor({ type: 'CUSTOMER', sub: 'cust-test-user' }));

  const createdInquiryIds: string[] = [];
  let testOrderId: string;
  let testOrderNumber: string;
  let testTrackingNumber: string;
  let testProduct: any;
  let testCustomer: any;

  beforeAll(async () => {
    testCustomer = customerFactory();
    await prisma.customer.upsert({
      where: { id: testCustomer.id },
      create: toCustomerData(testCustomer) as any,
      update: {},
    });

    testProduct = productFactory({
      name: 'Stage 3 Tracking Test Ring',
      status: 'ACTIVE',
    });
    const prodRes = await api().post('/api/products').set(ownerAuth).send(testProduct).expect(201);
    testProduct = prodRes.body;

    // Create a test order with known tracking details
    testOrderNumber = `GURU-TRACK-${Date.now()}`;
    testTrackingNumber = `BLUEDART-${Date.now()}`;
    const orderData = orderFactory({
      orderNumber: testOrderNumber,
      trackingNumber: testTrackingNumber,
      courierPartner: 'BlueDart Express',
      customer: {
        id: testCustomer.id,
        name: testCustomer.name,
        email: testCustomer.email,
        phone: testCustomer.phone,
      },
      items: [
        {
          id: uniqueId('oi'),
          orderId: '',
          productId: testProduct.id,
          productName: testProduct.name,
          image: '/test-img.jpg',
          quantity: 1,
          unitPrice: 5000,
          totalPrice: 5000,
          priceBreakdownSnapshot: {},
        },
      ],
    });

    const orderRes = await api().post('/api/orders').send(orderData).expect(201);
    testOrderId = orderRes.body.id;
  });

  afterAll(async () => {
    // Clean up created inquiries
    if (createdInquiryIds.length > 0) {
      await prisma.inquiry.deleteMany({
        where: { id: { in: createdInquiryIds } },
      });
    }

    // Clean up test order
    if (testOrderId) {
      await cleanupOrder(testOrderId);
    }

    // Clean up test product
    if (testProduct?.id) {
      await prisma.productMedia.deleteMany({ where: { productId: testProduct.id } });
      await prisma.inventoryItem.deleteMany({ where: { productId: testProduct.id } });
      await prisma.productVariant.deleteMany({ where: { productId: testProduct.id } });
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }

    // Clean up test customer
    if (testCustomer?.id) {
      await prisma.customer.deleteMany({ where: { id: testCustomer.id } });
    }

    await prisma.$disconnect();
  });

  // ==========================================
  // PHASE 1: INQUIRIES SYSTEM
  // ==========================================
  describe('Phase 1: Contact Form & PostgreSQL Inquiry System', () => {
    it('successfully submits a valid inquiry and persists to PostgreSQL', async () => {
      const payload = {
        name: 'Aarav Sharma',
        contactNumber: '+91 98765 43210',
        gmail: 'aarav.sharma@example.com',
        requirement: 'Bespoke Custom Order',
        message: 'Looking for a custom 18K yellow gold Solitaire diamond ring with VVS1 clarity.',
      };

      const res = await api().post('/api/inquiries').send(payload).expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.inquiry).toBeDefined();
      expect(res.body.inquiry.id).toBeDefined();
      expect(res.body.inquiry.status).toBe('NEW');
      expect(res.body.inquiry.name).toBe(payload.name);

      createdInquiryIds.push(res.body.inquiry.id);

      // Verify persistent in PostgreSQL
      const dbRecord = await prisma.inquiry.findUnique({
        where: { id: res.body.inquiry.id },
      });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.gmail).toBe(payload.gmail);
      expect(dbRecord?.status).toBe('NEW');
    });

    it('rejects inquiry with missing required fields with 400', async () => {
      const incomplete = {
        name: 'Test',
        // missing contactNumber, gmail, message
      };

      const res = await api().post('/api/inquiries').send(incomplete).expect(400);
      expect(res.body.message).toMatch(/contact number/i);
    });

    it('rejects inquiry with invalid email format with 400', async () => {
      const invalidEmail = {
        name: 'Test User',
        contactNumber: '+91 99999 88888',
        gmail: 'not-an-email',
        requirement: 'Rings',
        message: 'Hello, need help.',
      };

      const res = await api().post('/api/inquiries').send(invalidEmail).expect(400);
      expect(res.body.message).toMatch(/valid email/i);
    });

    it('rejects inquiry with oversized message (>3000 chars) with 400', async () => {
      const oversized = {
        name: 'Spam Bot',
        contactNumber: '+91 99999 88888',
        gmail: 'bot@example.com',
        requirement: 'Spam',
        message: 'X'.repeat(3005),
      };

      const res = await api().post('/api/inquiries').send(oversized).expect(400);
      expect(res.body.message).toMatch(/3,000 characters/i);
    });

    it('prevents public submission from injecting admin status or internal notes', async () => {
      const maliciousPayload = {
        name: 'Sneaky User',
        contactNumber: '+91 91234 56789',
        gmail: 'sneaky@example.com',
        requirement: 'Rings',
        message: 'Inquiring about diamond pendant.',
        status: 'RESPONDED', // Public injection attempt
        adminNotes: 'Fake admin note', // Public injection attempt
      };

      const res = await api().post('/api/inquiries').send(maliciousPayload).expect(201);
      createdInquiryIds.push(res.body.inquiry.id);

      // Must be forced to NEW and adminNotes undefined
      expect(res.body.inquiry.status).toBe('NEW');
      expect(res.body.inquiry.adminNotes).toBeUndefined();

      const dbRecord = await prisma.inquiry.findUnique({ where: { id: res.body.inquiry.id } });
      expect(dbRecord?.status).toBe('NEW');
      expect(dbRecord?.adminNotes).toBeNull();
    });

    it('denies unauthenticated access to GET /api/inquiries with 401', async () => {
      await api().get('/api/inquiries').expect(401);
    });

    it('denies customer role access to GET /api/inquiries with 403', async () => {
      await api().get('/api/inquiries').set(customerAuth).expect(403);
    });

    it('allows admin role to list inquiries with pagination and status filter', async () => {
      const res = await api()
        .get('/api/inquiries?status=NEW')
        .set(ownerAuth)
        .expect(200);

      expect(res.body.inquiries).toBeDefined();
      expect(Array.isArray(res.body.inquiries)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.inquiries.every((i: any) => i.status === 'NEW')).toBe(true);
    });

    it('allows admin to update inquiry status and internal notes via PATCH', async () => {
      const targetId = createdInquiryIds[0];
      const updatePayload = {
        status: 'RESPONDED',
        adminNotes: 'Contacted client via WhatsApp and emailed diamond certificate.',
      };

      const res = await api()
        .patch(`/api/inquiries/${targetId}/status`)
        .set(ownerAuth)
        .send(updatePayload)
        .expect(200);

      expect(res.body.status).toBe('RESPONDED');
      expect(res.body.adminNotes).toBe(updatePayload.adminNotes);

      // Verify persistence in DB
      const updated = await prisma.inquiry.findUnique({ where: { id: targetId } });
      expect(updated?.status).toBe('RESPONDED');
      expect(updated?.adminNotes).toBe(updatePayload.adminNotes);
    });

    it('rejects invalid inquiry status transitions with 400', async () => {
      const targetId = createdInquiryIds[0];
      await api()
        .patch(`/api/inquiries/${targetId}/status`)
        .set(ownerAuth)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  // ==========================================
  // PHASE 2: SECURE ORDER TRACKING
  // ==========================================
  describe('Phase 2: Secure Public Order Tracking', () => {
    it('returns sanitized fulfillment tracking by orderNumber with ZERO customer PII', async () => {
      const res = await api()
        .get(`/api/orders/track/${testOrderNumber}`)
        .expect(200);

      expect(res.body.orderNumber).toBe(testOrderNumber);
      expect(res.body.courierPartner).toBe('BlueDart Express');
      expect(res.body.trackingNumber).toBe(testTrackingNumber);
      expect(res.body.history).toBeDefined();
      expect(Array.isArray(res.body.history)).toBe(true);

      // STRICT PII SECURITY ASSERTIONS: Zero personal data leaked
      expect(res.body.customer).toBeUndefined();
      expect(res.body.customerSnapshot).toBeUndefined();
      expect(res.body.shippingAddress).toBeUndefined();
      expect(res.body.billingAddress).toBeUndefined();
      expect(res.body.totalAmount).toBeUndefined();
      expect(res.body.paymentMethod).toBeUndefined();
      expect(res.body.paymentStatus).toBeUndefined();
    });

    it('returns sanitized tracking by courier trackingNumber (AWB)', async () => {
      const res = await api()
        .get(`/api/orders/track/${testTrackingNumber}`)
        .expect(200);

      expect(res.body.orderNumber).toBe(testOrderNumber);
      expect(res.body.trackingNumber).toBe(testTrackingNumber);
      expect(res.body.customer).toBeUndefined();
    });

    it('rejects non-existent reference with 404', async () => {
      const res = await api()
        .get('/api/orders/track/NON-EXISTENT-ORDER-99999')
        .expect(404);

      expect(res.body.message).toMatch(/no shipment found/i);
    });

    it('rejects tracking request with missing or too-short reference with 400', async () => {
      await api().get('/api/orders/track/ab').expect(400);
    });

    it('validates contact detail when provided for guest tracking', async () => {
      // Correct contact matching customer phone/email
      await api()
        .get(`/api/orders/track/${testOrderNumber}?contact=${encodeURIComponent(testCustomer.email)}`)
        .expect(200);

      // Wrong contact returns 403 Forbidden
      const res = await api()
        .get(`/api/orders/track/${testOrderNumber}?contact=wrong.intruder@example.com`)
        .expect(403);

      expect(res.body.message).toMatch(/contact details provided do not match/i);
    });
  });

  // ==========================================
  // PHASE 3: DATABASE-DRIVEN SEO & SITEMAP
  // ==========================================
  describe('Phase 3: Database-Driven SEO Sitemap', () => {
    it('returns valid XML sitemap containing active database products from /sitemap.xml', async () => {
      const res = await api().get('/sitemap.xml').expect(200);

      expect(res.headers['content-type']).toMatch(/xml/);
      expect(res.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(res.text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

      // Must include published test product slug
      expect(res.text).toContain(`/product/${testProduct.slug}`);
      // Must include static storefront routes
      expect(res.text).toContain('<loc>https://gurudiamonds.in/shop</loc>');
      expect(res.text).toContain('<loc>https://gurudiamonds.in/contact</loc>');
    });

    it('returns valid XML image sitemap from /image-sitemap.xml', async () => {
      const res = await api().get('/image-sitemap.xml').expect(200);

      expect(res.headers['content-type']).toMatch(/xml/);
      expect(res.text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
    });

    it('returns compliant robots.txt that protects admin routes and references sitemaps', async () => {
      const res = await api().get('/robots.txt').expect(200);

      expect(res.headers['content-type']).toMatch(/text\/plain/);
      expect(res.text).toContain('Disallow: /admin');
      expect(res.text).toContain('Disallow: /checkout');
      expect(res.text).toContain('Disallow: /account');
      expect(res.text).toContain('Sitemap: https://gurudiamonds.in/sitemap.xml');
    });
  });

  // ==========================================
  // PHASE 4: CMS LIVE SYNCHRONIZATION
  // ==========================================
  describe('Phase 4: Authoritative CMS Live Synchronization', () => {
    it('fetches authoritative CMS content from GET /api/cms', async () => {
      const res = await api().get('/api/cms').expect(200);

      expect(res.body.announcementBar).toBeDefined();
      expect(res.body.heroBanner).toBeDefined();
      expect(res.body.footer).toBeDefined();
    });

    it('persists customized footer contact details without being overwritten by hardcoded constants', async () => {
      // 1. Fetch current CMS
      const initialRes = await api().get('/api/cms').expect(200);
      const currentCMS = initialRes.body;

      // 2. Admin updates footer with custom phone and address
      const customPhone = '+91 99887 76655';
      const customEmail = 'support.desk@gurudiamonds.in';
      const updatedPayload = {
        ...currentCMS,
        footer: {
          ...currentCMS.footer,
          phone: customPhone,
          email: customEmail,
        },
      };

      const putRes = await api()
        .put('/api/cms')
        .set(ownerAuth)
        .send(updatedPayload)
        .expect(200);

      expect(putRes.body.footer.phone).toBe(customPhone);
      expect(putRes.body.footer.email).toBe(customEmail);

      // 3. Storefront GET /api/cms must reflect this custom update!
      const storefrontRes = await api().get('/api/cms').expect(200);
      expect(storefrontRes.body.footer.phone).toBe(customPhone);
      expect(storefrontRes.body.footer.email).toBe(customEmail);
    });

    it('rejects unauthorized mutations to /api/cms with 401 or 403', async () => {
      await api().put('/api/cms').send({}).expect(401);
      await api().put('/api/cms').set(customerAuth).send({}).expect(403);
    });
  });
});

