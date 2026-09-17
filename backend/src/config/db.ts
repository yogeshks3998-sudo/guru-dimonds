import { PrismaClient } from '@prisma/client';

export const transactionOptions = {
  maxWait: 30_000,
  timeout: 30_000,
};

export const prisma: any = new PrismaClient({
  transactionOptions,
});
