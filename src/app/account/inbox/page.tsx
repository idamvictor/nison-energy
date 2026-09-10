import type { Metadata } from "next";

import { AccountInbox } from "@/components/account/account-inbox";
import { requireUser } from "@/lib/auth-dal";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function Page() {
  const user = await requireUser();
  return <AccountInbox userEmail={user.email} />;
}
