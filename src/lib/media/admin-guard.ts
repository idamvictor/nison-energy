import "server-only";

import { NextResponse } from "next/server";

import { checkPermission } from "@/lib/auth/session";

/**
 * For media /api routes (proxy.ts doesn't cover /api): anyone who can edit
 * products may upload/manage images and datasheets. Returns a 401 response to
 * send back, or null when allowed.
 */
export async function adminOnly(): Promise<NextResponse | null> {
  if (!(await checkPermission("products.edit"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
