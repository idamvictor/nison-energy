import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

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

export const requireAdmin = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
});
