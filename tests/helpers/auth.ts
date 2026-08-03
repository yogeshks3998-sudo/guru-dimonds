import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../backend/src/config/db';
import { env } from '../../backend/src/config/env';
import type { AuthTokenPayload } from '../../backend/src/middleware/auth';

export const TEST_ADMIN_EMAIL = 'Admin@gmail.com';
export const TEST_ADMIN_PASSWORD = 'Admin@123';
export const TEST_CUSTOMER_EMAIL = 'ananya.d@gmail.com';
export const TEST_CUSTOMER_PASSWORD = 'password123';

export const tokenFor = (payload: Partial<AuthTokenPayload> = {}) =>
  jwt.sign(
    {
      sub: payload.sub || `test-${payload.type || 'ADMIN'}-${payload.role || 'OWNER'}`,
      type: payload.type || 'ADMIN',
      role: payload.role || 'OWNER',
      email: payload.email || TEST_ADMIN_EMAIL,
    },
    env.jwtSecret,
    { expiresIn: '8h' }
  );

export const expiredTokenFor = (payload: Partial<AuthTokenPayload> = {}) =>
  jwt.sign(
    {
      sub: payload.sub || 'expired-admin',
      type: payload.type || 'ADMIN',
      role: payload.role || 'OWNER',
      email: payload.email || TEST_ADMIN_EMAIL,
    },
    env.jwtSecret,
    { expiresIn: -1 }
  );

export const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const ensureAdminLoginUser = async () => {
  const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 12);
  return prisma.adminUser.upsert({
    where: { email: TEST_ADMIN_EMAIL.toLowerCase() },
    create: {
      id: 'jest-admin-owner',
      name: 'Jest Owner Admin',
      email: TEST_ADMIN_EMAIL.toLowerCase(),
      role: 'OWNER',
      passwordHash,
      active: true,
    },
    update: {
      name: 'Jest Owner Admin',
      role: 'OWNER',
      passwordHash,
      active: true,
    },
  });
};
