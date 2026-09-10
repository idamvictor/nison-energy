import type { Metadata } from "next";

import { AccountInbox } from "@/components/account/account-inbox";
import { requireUser } from "@/lib/auth/session";
import { getLeadsForUser } from "@/lib/leads/queries";
import { getChargerOptions } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Inbox",
};

export default async function Page() {
  const user = await requireUser();
  const [leads, chargerRows] = await Promise.all([
    getLeadsForUser(user.id, user.email),
    getChargerOptions(),
  ]);
  const chargerOptions = chargerRows.map((c) => ({
    id: c.id,
    name: c.name,
    colour: c.colour,
    category: c.category as "Residential" | "Commercial",
  }));
  return <AccountInbox leads={leads} chargerOptions={chargerOptions} />;
}
