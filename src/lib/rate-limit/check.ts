import "server-only";

import { prisma } from "@/lib/db";

/**
 * DB-backed fixed-window rate limiter. In-memory counters don't work here —
 * this app runs as Vercel serverless functions, which don't share memory
 * between invocations — so hits are tracked in Postgres instead. Expired
 * hits for the key are deleted on every check (cheap, indexed on [key,
 * createdAt]), so there's no separate cleanup job to run.
 *
 * Returns true if the call is allowed (and records it), false if the caller
 * is over the limit for the current window.
 */
export async function checkRateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<boolean> {
  const cutoff = new Date(Date.now() - opts.windowMs);

  await prisma.rateLimitHit.deleteMany({
    where: { key, createdAt: { lt: cutoff } },
  });

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: cutoff } },
  });

  if (count >= opts.limit) return false;

  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}
