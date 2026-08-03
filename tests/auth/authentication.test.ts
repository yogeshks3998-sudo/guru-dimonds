/**
 * @jest-environment node
 */
import jwt from 'jsonwebtoken';
import { api } from '../helpers/api';
import {
  authHeader,
  ensureAdminLoginUser,
  expiredTokenFor,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
  tokenFor,
} from '../helpers/auth';
import { env } from '../../backend/src/config/env';
import { requireAuth } from '../../backend/src/middleware/auth';
import { prisma } from '../../backend/src/config/db';

describe('Authentication and JWT', () => {
  beforeAll(async () => {
    await ensureAdminLoginUser();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('valid admin login accepts Admin@gmail.com / Admin@123', async () => {
    const response = await api()
      .post('/api/auth/admin/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
      .expect(200);

    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.adminUser.role).toBe('OWNER');
  });

  it('invalid password is rejected', async () => {
    await api().post('/api/auth/admin/login').send({ email: TEST_ADMIN_EMAIL, password: 'wrong' }).expect(401);
  });

  it('invalid email is rejected', async () => {
    await api().post('/api/auth/admin/login').send({ email: 'missing@gurudimonds.in', password: TEST_ADMIN_PASSWORD }).expect(401);
  });

  it('generates JWTs with the expected payload', () => {
    const token = tokenFor({ role: 'OWNER', email: TEST_ADMIN_EMAIL });
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;

    expect(decoded.email).toBe(TEST_ADMIN_EMAIL);
    expect(decoded.role).toBe('OWNER');
  });

  it('validates JWTs on protected routes', async () => {
    await api().get('/api/customers').set(authHeader(tokenFor({ role: 'OWNER' }))).expect(200);
  });

  it('rejects expired JWTs', async () => {
    await api().get('/api/customers').set(authHeader(expiredTokenFor({ role: 'OWNER' }))).expect(401);
  });

  it('rejects unauthorized requests with missing JWT', async () => {
    await api().get('/api/customers').expect(401);
  });

  it('rejects invalid JWT strings', async () => {
    await api().get('/api/customers').set(authHeader('not-a-real-token')).expect(401);
  });

  it('requireAuth attaches decoded auth payload', (done) => {
    const req: any = { headers: { authorization: `Bearer ${tokenFor({ role: 'OWNER' })}` } };
    const res: any = {};

    requireAuth(req, res, () => {
      expect(req.auth.role).toBe('OWNER');
      done();
    });
  });
});
