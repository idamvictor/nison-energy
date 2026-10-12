import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { teamRoles, toRole } from "@/lib/auth/permissions";
import type { AdminUserDetail, AdminUserRow, Role } from "@/lib/users/types";

type ListUser = {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  createdAt: Date | string;
};

function toRow(u: ListUser): AdminUserRow {
  return {
    id: u.id,
    name: u.name?.trim() || u.email.split("@")[0],
    email: u.email,
    role: toRole(u.role),
    banned: u.banned ?? false,
    banReason: u.banReason ?? null,
    emailVerified: u.emailVerified ?? false,
    image: u.image ?? null,
    createdAt: new Date(u.createdAt).toISOString(),
  };
}

export const getUsers = cache(
  async (opts: {
    q?: string;
    role?: Role;
    limit?: number;
    offset?: number;
  }): Promise<{ users: AdminUserRow[]; total: number }> => {
    const { q, role, limit = 50, offset = 0 } = opts;
    // Straight from the DB (not the auth admin API) so view-only staff can list users too.
    const where = {
      ...(q ? { email: { contains: q, mode: "insensitive" as const } } : {}),
      ...(role ? (role === "user" ? { NOT: { role: { in: [...teamRoles] } } } : { role }) : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.user.count({ where }),
    ]);
    return { users: rows.map(toRow), total };
  },
);

export const getUser = cache(
  async (id: string): Promise<AdminUserDetail | null> => {
    const row = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { expiresAt: "desc" } },
        accounts: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!row) return null;
    return {
      ...toRow(row),
      phone: row.phone ?? null,
      address: row.address ?? null,
      postcode: row.postcode ?? null,
      banExpires: row.banExpires ? row.banExpires.toISOString() : null,
      sessions: row.sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        ipAddress: s.ipAddress ?? null,
        userAgent: s.userAgent ?? null,
      })),
      accounts: row.accounts.map((a) => ({
        id: a.id,
        providerId: a.providerId,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  },
);

export const getUserCounts = cache(async () => {
  const [total, admins, banned] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: [...teamRoles] } } }),
    prisma.user.count({ where: { banned: true } }),
  ]);
  return { total, admins, banned };
});
