import type { Metadata } from "next";

import { AccountOverview } from "@/components/account/account-overview";
import { requireUser } from "@/lib/auth-dal";

export const metadata: Metadata = { title: "Overview" };

export default async function AccountOverviewPage() {
  const user = await requireUser();
  return <AccountOverview user={user} />;
}
