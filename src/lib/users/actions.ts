"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { requireAdmin } from "@/lib/auth/session";
import { roleOptions, type Role, type UserActionResult } from "@/lib/users/types";

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

export async function setUserRole(
  userId: string,
  role: Role,
): Promise<UserActionResult> {
  const me = await requireAdmin();
  if (!roleOptions.includes(role)) {
    return { ok: false, error: "Unknown role." };
  }
  if (userId === me.id) {
    return { ok: false, error: "You can't change your own role." };
  }
  try {
    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role },
    });
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err, "Couldn't update the role.") };
  }
}

export async function setUserBanned(
  userId: string,
  banned: boolean,
  reason?: string,
): Promise<UserActionResult> {
  const me = await requireAdmin();
  if (userId === me.id) {
    return { ok: false, error: "You can't ban your own account." };
  }
  try {
    if (banned) {
      await auth.api.banUser({
        headers: await headers(),
        body: {
          userId,
          ...(reason?.trim() ? { banReason: reason.trim() } : {}),
        },
      });
    } else {
      await auth.api.unbanUser({
        headers: await headers(),
        body: { userId },
      });
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
