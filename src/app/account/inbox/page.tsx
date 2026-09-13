import type { Metadata } from "next";

import { AccountInbox } from "@/components/account/account-inbox";
import { requireUser } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/lib/notifications/queries";
import { getChargerOptions } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function Page() {
  const user = await requireUser();
  const [notifications, chargerRows] = await Promise.all([
    getNotificationsForUser(user.id),
    getChargerOptions(),
  ]);
  const chargerOptions = chargerRows.map((c) => ({
    id: c.id,
    name: c.name,
    colour: c.colour,
    category: c.category as "Residential" | "Commercial",
  }));
  return (
    <AccountInbox notifications={notifications} chargerOptions={chargerOptions} />
  );
}
