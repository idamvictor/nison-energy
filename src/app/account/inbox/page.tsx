import type { Metadata } from "next";

import { AccountInbox } from "@/components/account/account-inbox";
import { requireUser } from "@/lib/auth-dal";
import { getLeadsForUser } from "@/lib/leads-dal";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function Page() {
  const user = await requireUser();
  const leads = await getLeadsForUser(user.id, user.email);
  return <AccountInbox leads={leads} />;
}
