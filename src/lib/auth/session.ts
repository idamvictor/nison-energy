import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { can, type Permission } from "@/lib/auth/permissions";

// Memoised for the render pass so a layout + page + nested components share one
// session lookup. See node_modules/next/dist/docs/01-app/02-guides/authentication.md
// (Data Access Layer).
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

// Any signed-in user (customer or staff). Used to guard /account.
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/account");
  return user;
});

/** Any team member (super admin, admin or staff) — the gate for /admin. */
export const requireAdmin = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/admin");
  if (!can(user.role, "admin.access")) redirect("/");
  return user;
});

/**
 * A team member holding `permission`. Non-team users are sent home; team
 * members without it get a 404 (e.g. /admin/prices for an Admin), so the
 * page doesn't even reveal it exists.
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAdmin();
  if (!can(user.role, permission)) notFound();
  return user;
}

/** For server actions / API routes: the user if allowed, otherwise null. */
export async function checkPermission(permission: Permission): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  return user && can(user.role, permission) ? user : null;
}

export const NOT_ALLOWED = "You don't have permission to do that.";
