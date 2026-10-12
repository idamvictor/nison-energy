import "server-only";

import { prisma } from "@/lib/db";
import { assignableRoles, teamRoles, type AssignableRole, type TeamRole } from "@/lib/auth/permissions";
import { hashInviteToken } from "@/lib/team/token";
import type { InviteState, PendingInvite, TeamMember } from "@/lib/team/types";

const RANK: Record<TeamRole, number> = { superadmin: 0, admin: 1, staff: 2 };

/** Everyone with a team role, Super admin first. */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const users = await prisma.user.findMany({
    where: { role: { in: [...teamRoles] } },
    select: { id: true, name: true, email: true, role: true, image: true, banned: true },
    orderBy: { name: "asc" },
  });
  return users
    .map((u) => ({ ...u, role: u.role as TeamRole, banned: u.banned ?? false }))
    .sort((a, b) => RANK[a.role] - RANK[b.role]);
}

/** Invites not yet accepted or revoked (expired ones included, flagged). */
export async function getPendingInvites(): Promise<PendingInvite[]> {
  const invites = await prisma.staffInvite.findMany({
    where: { acceptedAt: null, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
  const now = Date.now();
  return invites.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role as AssignableRole,
    invitedByName: i.invitedByName,
    createdAt: i.createdAt.toISOString(),
    expiresAt: i.expiresAt.toISOString(),
    expired: i.expiresAt.getTime() < now,
  }));
}

/** The usable invite for a raw token, or null (unknown, used, revoked, expired). */
export async function findUsableInvite(token: string) {
  if (!token || token.length > 200) return null;
  const invite = await prisma.staffInvite.findUnique({ where: { tokenHash: hashInviteToken(token) } });
  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) return null;
  if (!(assignableRoles as readonly string[]).includes(invite.role)) return null;
  return { ...invite, role: invite.role as AssignableRole };
}

export async function getInviteState(token: string): Promise<InviteState> {
  const invite = await findUsableInvite(token);
  if (!invite) return { status: "invalid" };
  const existing = await prisma.user.findFirst({
    where: { email: { equals: invite.email, mode: "insensitive" } },
    select: { id: true },
  });
  return {
    status: "valid",
    email: invite.email,
    role: invite.role,
    invitedByName: invite.invitedByName,
    hasAccount: existing !== null,
  };
}
