import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 requires a driver adapter. `pg` opens a real connection pool, so we
// cache a single client on `globalThis` to survive dev hot-reloads.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Prisma Postgres connection string to .env",
    );
  }
  const pool = new Pool({
    connectionString,
    // Prisma Postgres reaps idle server-side connections after a few minutes.
    // TCP keepalives + closing our own idle clients first keeps the pool from
    // handing out a dead connection (which surfaced as OAuth callbacks failing
    // with "Connection terminated unexpectedly").
    keepAlive: true,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    max: 5,
  });
  // An idle client dropped by the server emits here; swallow it so it doesn't
  // crash the process — the pool discards the client and reconnects on demand.
  pool.on("error", () => {});
  return pool;
}

function createPrismaClient() {
  const pool = globalForPrisma.pgPool ?? createPool();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
