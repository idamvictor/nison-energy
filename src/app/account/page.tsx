import type { Metadata } from "next";

import { AccountOverview } from "@/components/account/account-overview";
import { requireUser } from "@/lib/auth-dal";
import { getLeadsForUser } from "@/lib/leads-dal";
import { getOrdersForUser } from "@/lib/orders-dal";

export const metadata: Metadata = { title: "Overview" };

export default async function AccountOverviewPage() {
  const user = await requireUser();
  const [leads, orders] = await Promise.all([
    getLeadsForUser(user.id, user.email),
    getOrdersForUser(user.id, user.email),
  ]);
  return (
    <AccountOverview
      user={user}
      orderCount={orders.length}
      enquiryCount={leads.length}
    />
  );
}
