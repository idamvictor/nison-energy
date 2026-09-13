// User-management view types + write results — safe to import from client
// components. Backed by the Better Auth `user` table + admin() plugin.

export const roleOptions = ["admin", "user"] as const;
export type Role = (typeof roleOptions)[number];

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
