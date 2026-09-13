import type { Metadata } from "next";

import { AccountOverview } from "@/components/account/account-overview";
import { requireUser } from "@/lib/auth/session";
import { getLeadsForUser } from "@/lib/leads/queries";
import { getOrdersForUser } from "@/lib/orders/queries";
import { getUnreadCount } from "@/lib/notifications/queries";

export const metadata: Metadata = { title: "Overview" };

export default async function AccountOverviewPage() {
  const user = await requireUser();
  const [leads, orders, unreadCount] = await Promise.all([
    getLeadsForUser(user.id, user.email),
    getOrdersForUser(user.id, user.email),
    getUnreadCount(user.id),
  ]);
  return (
    <AccountOverview
      user={user}
      orderCount={orders.length}
      enquiryCount={leads.length}
      unreadCount={unreadCount}
    />
  );
}
