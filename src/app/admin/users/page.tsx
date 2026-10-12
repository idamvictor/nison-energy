import type { Metadata } from "next";

import { UsersView } from "@/components/admin/users/users-view";
import { TeamPanel } from "@/components/admin/users/team-panel";
import { requireAdmin } from "@/lib/auth/session";
import { toRole } from "@/lib/auth/permissions";
import { getUsers, getUserCounts } from "@/lib/users/queries";
import { getPendingInvites, getTeamMembers } from "@/lib/team/queries";

export const metadata: Metadata = { title: "Users | Admin" };

export default async function AdminUsersPage() {
  const [me, { users }, counts, members, invites] = await Promise.all([
    requireAdmin(),
    getUsers({ limit: 200 }),
    getUserCounts(),
    getTeamMembers(),
    getPendingInvites(),
  ]);
  const myRole = toRole(me.role);

  return (
    <div className="flex flex-col gap-6">
      <TeamPanel members={members} invites={invites} currentUserId={me.id} myRole={myRole} />
      <UsersView users={users} counts={counts} currentUserId={me.id} myRole={myRole} />
    </div>
  );
}
