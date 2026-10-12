"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";
import { NOT_ALLOWED, checkPermission, getCurrentUser } from "@/lib/auth/session";
import {
  assignableRoles,
  canManageUser,
  isTeamRole,
  roleLabels,
  type AssignableRole,
} from "@/lib/auth/permissions";
import { sendEmail } from "@/lib/email/client";
import { teamInviteEmail } from "@/lib/email/templates";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getClientIp } from "@/lib/rate-limit/ip";
import { findUsableInvite } from "@/lib/team/queries";
import { newInviteToken } from "@/lib/team/token";
import { INVITE_TTL_DAYS, type TeamActionResult } from "@/lib/team/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RANK = { user: 0, staff: 1, admin: 2, superadmin: 3 } as const;

function expiry(): Date {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60_000);
}

function revalidate() {
  revalidatePath("/admin/users");
}

async function emailInvite(email: string, role: AssignableRole, token: string, inviterName: string) {
  await sendEmail({
    to: email,
    ...teamInviteEmail({ inviterName, roleLabel: roleLabels[role], url: `${SITE_URL}/invite/${token}` }),
  });
}

/** Invite someone to the team by email (Admins & the Super admin). */
export async function sendTeamInvite(input: { email: string; role: string }): Promise<TeamActionResult> {
  const me = await checkPermission("team.manage");
  if (!me) return { ok: false, error: NOT_ALLOWED };

  const email = String(input.email ?? "").trim().toLowerCase();
  const role = input.role as AssignableRole;
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Enter a valid email address." };
  if (!assignableRoles.includes(role) || !canManageUser(me.role, role)) return { ok: false, error: "Choose Admin or Staff." };

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { role: true, banned: true },
  });
  if (existing && isTeamRole(existing.role)) {
    return { ok: false, error: `${email} is already on the team as ${roleLabels[existing.role]}.` };
  }
  if (existing?.banned) return { ok: false, error: "That account is banned — unban it first." };

  const { token, tokenHash } = newInviteToken();
  const now = new Date();
  // One live invite per email — a new one replaces any earlier link.
  await prisma.$transaction([
    prisma.staffInvite.updateMany({
      where: { email, acceptedAt: null, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.staffInvite.create({
      data: { email, role, tokenHash, invitedById: me.id, invitedByName: me.name, expiresAt: expiry() },
    }),
  ]);

  await emailInvite(email, role, token, me.name);
  revalidate();
  return { ok: true };
}

/** New link + fresh 7 days; the old link stops working. */
export async function resendTeamInvite(id: string): Promise<TeamActionResult> {
  const me = await checkPermission("team.manage");
  if (!me) return { ok: false, error: NOT_ALLOWED };
  const invite = await prisma.staffInvite.findUnique({ where: { id } });
  if (!invite || invite.acceptedAt || invite.revokedAt) return { ok: false, error: "This invite is no longer pending." };
  const role = invite.role as AssignableRole;
  if (!canManageUser(me.role, role)) return { ok: false, error: NOT_ALLOWED };

  const { token, tokenHash } = newInviteToken();
  await prisma.staffInvite.update({
    where: { id },
    data: { tokenHash, expiresAt: expiry(), invitedById: me.id, invitedByName: me.name },
  });
  await emailInvite(invite.email, role, token, me.name);
  revalidate();
  return { ok: true };
}

export async function revokeTeamInvite(id: string): Promise<TeamActionResult> {
  const me = await checkPermission("team.manage");
  if (!me) return { ok: false, error: NOT_ALLOWED };
  const invite = await prisma.staffInvite.findUnique({ where: { id } });
  if (!invite || invite.acceptedAt || invite.revokedAt) return { ok: false, error: "This invite is no longer pending." };
  if (!canManageUser(me.role, invite.role)) return { ok: false, error: NOT_ALLOWED };
  await prisma.staffInvite.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidate();
  return { ok: true };
}

/**
 * Gives `userId` the invite's role (never lowers someone already ranked
 * higher) and marks the invite used. Only call once the token and the email
 * have both been checked.
 */
async function applyInvite(inviteId: string, userId: string, currentRole: string | null, role: AssignableRole) {
  const keep = isTeamRole(currentRole) && RANK[currentRole] >= RANK[role];
  // Guarded on acceptedAt so a double-submit can't use the invite twice.
  const claimed = await prisma.staffInvite.updateMany({
    where: { id: inviteId, acceptedAt: null, revokedAt: null },
    data: { acceptedAt: new Date() },
  });
  if (claimed.count === 0) return false;
  await prisma.user.update({
    where: { id: userId },
    data: { ...(keep ? {} : { role }), emailVerified: true },
  });
  return true;
}

/** Signed-in invitee presses "Accept invite". */
export async function acceptTeamInvite(token: string): Promise<TeamActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Please sign in first." };
  const invite = await findUsableInvite(token);
  if (!invite) return { ok: false, error: "This invite is no longer valid — ask an admin for a new one." };
  if (me.email.toLowerCase() !== invite.email.toLowerCase()) {
    return { ok: false, error: `This invite is for ${invite.email}, but you're signed in as ${me.email}.` };
  }
  if (me.banned) return { ok: false, error: NOT_ALLOWED };

  if (!(await applyInvite(invite.id, me.id, me.role ?? null, invite.role))) {
    return { ok: false, error: "This invite is no longer valid — ask an admin for a new one." };
  }
  // Refresh the 60s session cookie cache so /admin sees the new role now.
  await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  revalidate();
  return { ok: true };
}

/** No account yet: create one for the invited email, apply the role and sign in. */
export async function createInvitedAccount(input: {
  token: string;
  name: string;
  password: string;
}): Promise<TeamActionResult> {
  const ip = await getClientIp();
  if (!(await checkRateLimit(`invite-signup:${ip}`, { limit: 10, windowMs: 60 * 60_000 }))) {
    return { ok: false, error: "Too many attempts — please try again later." };
  }

  const invite = await findUsableInvite(String(input.token ?? ""));
  if (!invite) return { ok: false, error: "This invite is no longer valid — ask an admin for a new one." };

  const name = String(input.name ?? "").trim().slice(0, 120);
  const password = String(input.password ?? "");
  if (!name) return { ok: false, error: "Please enter your name." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (password.length > 128) return { ok: false, error: "Password is too long." };

  const taken = await prisma.user.findFirst({
    where: { email: { equals: invite.email, mode: "insensitive" } },
    select: { id: true },
  });
  if (taken) return { ok: false, error: "An account with this email already exists — sign in to accept." };

  const reqHeaders = await headers();
  try {
    const created = await auth.api.signUpEmail({
      body: { email: invite.email, name, password },
      headers: reqHeaders,
    });
    if (!(await applyInvite(invite.id, created.user.id, null, invite.role))) {
      return { ok: false, error: "This invite is no longer valid — ask an admin for a new one." };
    }
    // Sign-up set a session cookie that still says "customer"; replace it with
    // a fresh one carrying the new role.
    await prisma.session.deleteMany({ where: { userId: created.user.id } });
    await auth.api.signInEmail({ body: { email: invite.email, password }, headers: reqHeaders });
  } catch {
    return { ok: false, error: "Couldn't create your account — please try again." };
  }
  revalidate();
  return { ok: true };
}
