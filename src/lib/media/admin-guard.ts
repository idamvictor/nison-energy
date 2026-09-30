import "server-only";

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

/**
 * For admin-only /api routes (proxy.ts doesn't cover /api). Returns a 401
 * response to send back, or null when the caller is an admin.
 */
export async function adminOnly(): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
