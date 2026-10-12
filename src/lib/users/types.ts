// User-management view types + write results — safe to import from client
// components. Backed by the Better Auth `user` table + admin() plugin.

import type { Role } from "@/lib/auth/permissions";

export type { Role };
/** Every stored role, highest first (customers are "user"). */
export const roleOptions = ["superadmin", "admin", "staff", "user"] as const satisfies readonly Role[];
/** Roles the admin can switch someone to (the Super admin is fixed). */
export const settableRoles = ["admin", "staff", "user"] as const satisfies readonly Role[];

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned: boolean;
  banReason: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: string; // ISO
};

export type UserSessionView = {
  id: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  ipAddress: string | null;
  userAgent: string | null;
};

export type UserAccountView = {
  id: string;
  providerId: string;
  createdAt: string; // ISO
};

export type AdminUserDetail = AdminUserRow & {
  phone: string | null;
  address: string | null;
  postcode: string | null;
  banExpires: string | null; // ISO
  sessions: UserSessionView[];
  accounts: UserAccountView[];
};

export type UserActionResult =
  | { ok: true }
  | { ok: false; error: string };
