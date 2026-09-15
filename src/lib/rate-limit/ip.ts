import "server-only";

import { headers } from "next/headers";

/**
 * Best-effort client IP for rate-limit keys. Works in both Server Actions and
 * Route Handlers since it reads via next/headers rather than a Request object.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
