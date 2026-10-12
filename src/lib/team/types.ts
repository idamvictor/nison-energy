// Team invites — safe to import from client components.

import type { AssignableRole, TeamRole } from "@/lib/auth/permissions";

export const INVITE_TTL_DAYS = 7;

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  image: string | null;
  banned: boolean;
};

export type PendingInvite = {
  id: string;
  email: string;
  role: AssignableRole;
  invitedByName: string | null;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  expired: boolean;
};

export type TeamActionResult = { ok: true } | { ok: false; error: string };

/** What /invite/[token] shows. */
export type InviteState =
  | { status: "invalid" }
  | {
      status: "valid";
      email: string;
      role: AssignableRole;
      invitedByName: string | null;
      /** An account with the invited email already exists. */
      hasAccount: boolean;
    };
