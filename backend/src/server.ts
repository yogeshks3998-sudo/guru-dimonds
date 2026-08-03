import { env } from './config/env';
import { prisma } from './config/db';
import { app } from './app';

const server = app.listen(env.port, () => {
  console.log(`Vedaara API listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

