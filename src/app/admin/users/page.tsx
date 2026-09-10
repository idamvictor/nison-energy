import type { Metadata } from "next";

import { UsersView } from "@/components/admin/users/users-view";
import { requireAdmin } from "@/lib/auth/session";
import { getUsers, getUserCounts } from "@/lib/users/queries";

export const metadata: Metadata = { title: "Users | Admin" };

export default async function AdminUsersPage() {
  const [me, { users }, counts] = await Promise.all([
    requireAdmin(),
    getUsers({ limit: 200 }),
    getUserCounts(),
  ]);

  return <UsersView users={users} counts={counts} currentUserId={me.id} />;
}
