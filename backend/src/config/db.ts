import { PrismaClient } from '@prisma/client';

export const transactionOptions = {
  maxWait: 10_000,
  timeout: 10_000,
};

export const prisma: any = new PrismaClient({
  transactionOptions,
});
