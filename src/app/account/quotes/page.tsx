import type { Metadata } from "next";

import { AccountQuotes } from "@/components/account/account-quotes";
import { requireUser } from "@/lib/auth/session";
import { getQuotesForUser } from "@/lib/quotes/queries";

export const metadata: Metadata = { title: "Quotes" };

export default async function AccountQuotesPage() {
  const user = await requireUser();
  const quotes = await getQuotesForUser(user.id);
  return <AccountQuotes quotes={quotes} />;
}
