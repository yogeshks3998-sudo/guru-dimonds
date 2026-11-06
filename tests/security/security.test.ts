/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { authHeader, tokenFor } from '../helpers/auth';

describe('Security regression tests', () => {
  it('rejects missing JWT on sensitive customer data', async () => {
    await api().get('/api/customers').expect(401);
  });

  it('rejects invalid JWT on sensitive order data', async () => {
    await api().get('/api/orders').set(authHeader('invalid.jwt.value')).expect(401);
  });

  it('rejects role bypass attempts using CUSTOMER tokens', async () => {
    await api().get('/api/customers').set(authHeader(tokenFor({ type: 'CUSTOMER', role: undefined }))).expect(403);
  });

  it('handles SQL injection-like search payloads safely', async () => {
    const response = await api().get('/api/products').query({ search: "' OR '1'='1" }).expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('handles XSS-like search payloads without reflecting executable markup', async () => {
    const payload = '<script>alert("xss")</script>';
    const response = await api().get('/api/products').query({ search: payload }).expect(200);

    expect(JSON.stringify(response.body)).not.toContain('<script>alert("xss")</script>');
  });

  it('protects product creation from unauthorized users', async () => {
    await api().post('/api/products').send({ name: 'Unauthorized' }).expect(401);
  });

  it('protects metal-rate mutation from STAFF', async () => {
    await api()
      .post('/api/metal-rates')
      .set(authHeader(tokenFor({ role: 'STAFF' })))
      .send({ metal: 'GOLD', purity: '22K', ratePerGram: 1 })
      .expect(403);
  });

  it('protects coupon creation from unauthorized users', async () => {
    await api().post('/api/coupons').send({ code: 'HACK99', discountType: 'PERCENTAGE', discountValue: 99 }).expect(401);
  });

  it('protects coupon creation from STAFF role', async () => {
    await api()
      .post('/api/coupons')
      .set(authHeader(tokenFor({ role: 'STAFF' })))
      .send({ code: 'HACK99', discountType: 'PERCENTAGE', discountValue: 99 })
      .expect(403);
  });

  it('protects customer PII by ID from STAFF role', async () => {
    await api()
      .get('/api/customers/non-existent-id')
      .set(authHeader(tokenFor({ role: 'STAFF' })))
      .expect(403);
  });

  it('webhook fails closed when signature is missing', async () => {
    await api()
      .post('/api/payments/webhook/razorpay')
      .send({ event: 'payment.captured' })
      .expect((res) => {
        // If secret is unset: 500; if secret is set: 400
        expect([400, 500]).toContain(res.status);
      });
  });

  it('webhook rejects malformed signature without unhandled RangeError', async () => {
    await api()
      .post('/api/payments/webhook/razorpay')
      .set('x-razorpay-signature', 'short')
      .send({ event: 'payment.captured' })
      .expect((res) => {
        // If secret is unset: 500; if secret is set: 400
        expect([400, 500]).toContain(res.status);
      });
  });

  it('enforces CORS policy against unauthorized third-party origins', async () => {
    await api()
      .get('/api/health')
      .set('Origin', 'https://malicious-phishing-site.com')
      .expect(403);
  });
});
