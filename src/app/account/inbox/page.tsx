import type { Metadata } from "next";

import { AccountInbox } from "@/components/account/account-inbox";
import { requireUser } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/lib/notifications/queries";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function Page() {
  const user = await requireUser();
  const notifications = await getNotificationsForUser(user.id);
  return <AccountInbox notifications={notifications} />;
}
