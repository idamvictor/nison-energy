import { PrismaPg } from "@prisma/adapter-pg";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 requires a driver adapter. `pg` opens a real connection pool, so we
// cache a single client on `globalThis` to survive dev hot-reloads.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
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
    // Prisma Postgres reaps idle server-side connections. TCP keepalives +
    // closing our own idle clients early keeps the pool from handing out a
    // dead connection ("Server has closed the connection" / "Connection
    // terminated unexpectedly"); reads that still hit one are retried below.
    keepAlive: true,
    idleTimeoutMillis: 10_000,
    // Also bounds the wait for a free pool slot. At build time each worker
    // prerenders many pages through these 5 connections, so let them queue.
    connectionTimeoutMillis:
      process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD ? 120_000 : 10_000,
    max: 5,
  });
  // An idle client dropped by the server emits here; swallow it so it doesn't
  // crash the process — the pool discards the client and reconnects on demand.
  pool.on("error", () => {});
  return pool;
}

/**
 * The single pg pool Prisma runs on. Exposed for the rare hot path where
 * Prisma's raw-query result mapping is too slow — e.g. reading 1MB bytea
 * slices for datasheet range requests (~200ms via pg vs ~4s via $queryRaw).
 */
export function pgPool(): Pool {
  return (globalForPrisma.pgPool ??= createPool());
}

// Only reads are retried: a write whose connection dropped may already have
// committed, and running it again could duplicate a lead or an order.
const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

// pg/driver messages for a dead socket, plus Postgres SQLSTATEs for a backend
// the server terminated (57P01–57P03) or a connection exception (class 08).
const CONNECTION_ERROR =
  /Connection terminated|ConnectionClosed|closed the connection|terminating connection|ECONNRESET|ETIMEDOUT|connection timeout|\b57P0[1-3]\b|\b08[0-9A-Z]{3}\b/i;

/** P1017 = server closed the connection; adapter errors carry pg's message in `cause`. */
function isConnectionError(error: unknown): boolean {
  const e = error as { code?: string; message?: string; cause?: { message?: string } } | null;
  return e?.code === "P1017" || CONNECTION_ERROR.test(`${e?.message} ${e?.cause?.message}`);
}

function createPrismaClient() {
  return new PrismaClient({ adapter: new PrismaPg(pgPool()) }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          try {
            return await query(args);
          } catch (error) {
            if (!READ_OPERATIONS.has(operation) || !isConnectionError(error)) throw error;
            // The pool has discarded the dead client; this runs on a fresh one.
            return query(args);
          }
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
