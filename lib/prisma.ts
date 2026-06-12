import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { startSyncScheduler } from './sync-scheduler';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const logOptions = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

  if (process.env.TURSO_DATABASE_URL) {
    const libsqlClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSQL(libsqlClient);
    return new PrismaClient({
      adapter,
      log: logOptions as any,
    });
  }

  return new PrismaClient({
    log: logOptions as any,
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Boot auto-synchronization background runner
startSyncScheduler();

