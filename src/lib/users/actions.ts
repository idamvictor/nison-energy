"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { NOT_ALLOWED, checkPermission } from "@/lib/auth/session";
import { canManageUser, type Role } from "@/lib/auth/permissions";
import type { UserActionResult } from "@/lib/users/types";

/** Roles that can be set from the admin: team roles below Super admin, or back to customer. */
const SETTABLE: Role[] = ["admin", "staff", "user"];

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const body = (err as { body?: { message?: string } }).body;
    if (body?.message) return body.message;
    const message = (err as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

function revalidate() {
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

/**
 * Loads the target and checks the signed-in user may manage them: needs
 * team.manage, never yourself, never the Super admin, never someone above you.
 */
async function authorise(userId: string, selfError: string) {
  const me = await checkPermission("team.manage");
  if (!me) return { error: NOT_ALLOWED } as const;
  if (userId === me.id) return { error: selfError } as const;
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) return { error: "User not found." } as const;
  if (!canManageUser(me.role, target.role)) return { error: NOT_ALLOWED } as const;
  return { me, target } as const;
}

/** Sign someone out everywhere, so a role change / removal takes effect now. */
async function endSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function setUserRole(userId: string, role: Role): Promise<UserActionResult> {
  if (!SETTABLE.includes(role)) return { ok: false, error: "Unknown role." };
  const auth_ = await authorise(userId, "You can't change your own role.");
  if ("error" in auth_) return { ok: false, error: auth_.error as string };
  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await endSessions(userId);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err, "Couldn't update the role.") };
  }
}

export async function removeUser(userId: string): Promise<UserActionResult> {
  const auth_ = await authorise(userId, "You can't delete your own account.");
  if ("error" in auth_) return { ok: false, error: auth_.error as string };
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err, "Couldn't delete the user.") };
  }
}

export async function setUserBanned(userId: string, banned: boolean, reason?: string): Promise<UserActionResult> {
  const auth_ = await authorise(userId, "You can't ban your own account.");
  if ("error" in auth_) return { ok: false, error: auth_.error as string };
  try {
    if (banned) {
      await auth.api.banUser({
        headers: await headers(),
        body: { userId, ...(reason?.trim() ? { banReason: reason.trim() } : {}) },
      });
    } else {
      await auth.api.unbanUser({ headers: await headers(), body: { userId } });
    }
    revalidate();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: errorMessage(err, banned ? "Couldn't ban the user." : "Couldn't unban the user."),
    };
  }
}
