/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { authHeader, tokenFor } from '../helpers/auth';
import { couponFactory, orderFactory } from '../helpers/factories';
import { cleanupOrder } from '../helpers/db';
import { prisma } from '../../backend/src/config/db';

describe('Commerce APIs', () => {
  const owner = authHeader(tokenFor({ role: 'OWNER' }));
  const orderManager = authHeader(tokenFor({ role: 'ORDER_MANAGER' }));
  const finance = authHeader(tokenFor({ role: 'FINANCE' }));
  const staff = authHeader(tokenFor({ role: 'STAFF' }));
  const order = orderFactory();
  const coupon = couponFactory();

  afterAll(async () => {
    await cleanupOrder(order.id);
    await prisma.coupon.deleteMany({ where: { id: coupon.id } });
    await prisma.$disconnect();
  });

  it('GET /api/coupons returns coupons', async () => {
    const response = await api().get('/api/coupons').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/coupons creates or updates a coupon', async () => {
    const response = await api().post('/api/coupons').send(coupon).expect(201);

    expect(response.body.code).toBe(coupon.code);
  });

  it('POST /api/coupons/validate accepts a valid coupon', async () => {
    const response = await api().post('/api/coupons/validate').send({ code: coupon.code, subtotal: 5000 }).expect(200);

    expect(response.body.success).toBe(true);
  });

  it('POST /api/coupons/validate rejects invalid coupon IDs', async () => {
    const response = await api().post('/api/coupons/validate').send({ code: 'NOPE', subtotal: 5000 }).expect(404);

    expect(response.body.success).toBe(false);
  });

  it('POST /api/orders creates an order scaffold', async () => {
    const response = await api().post('/api/orders').send(order).expect(201);

    expect(response.body.id).toBe(order.id);
  });

  it('GET /api/orders lists orders for OWNER', async () => {
    const response = await api().get('/api/orders').set(owner).expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/orders/:id returns an order for FINANCE', async () => {
    const response = await api().get(`/api/orders/${order.id}`).set(finance).expect(200);

    expect(response.body.id).toBe(order.id);
  });

  it('PATCH /api/orders/:id/status allows ORDER_MANAGER lifecycle updates', async () => {
    const response = await api()
      .patch(`/api/orders/${order.id}/status`)
      .set(orderManager)
      .send({ status: 'PROCESSING', note: 'Jest processing' })
      .expect(200);

    expect(response.body.orderStatus).toBe('PROCESSING');
  });

  it('PATCH /api/orders/:id/status rejects invalid lifecycle transitions', async () => {
    const response = await api()
      .patch(`/api/orders/${order.id}/status`)
      .set(orderManager)
      .send({ status: 'DELIVERED' })
      .expect(400);

    expect(response.body.message).toMatch(/Cannot transition/i);
  });

  it('GET /api/customers lists customers for ORDER_MANAGER', async () => {
    const response = await api().get('/api/customers').set(orderManager).expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/customers denies STAFF', async () => {
    await api().get('/api/customers').set(staff).expect(403);
  });

  it('GET /api/cms returns CMS content', async () => {
    const response = await api().get('/api/cms').expect(200);

    expect(response.body.footer.email).toBeDefined();
  });

  it('GET /api/metal-rates returns metal rates', async () => {
    const response = await api().get('/api/metal-rates').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/metal-rates allows FINANCE', async () => {
    const response = await api()
      .post('/api/metal-rates')
      .set(finance)
      .send({ metal: 'SILVER', purity: '925', ratePerGram: 83, notes: 'Jest rate' })
      .expect(201);

    expect(response.body.ratePerGram).toBe(83);
  });
});
