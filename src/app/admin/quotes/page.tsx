import type { Metadata } from "next";

import { QuotesTableView } from "@/components/admin/quotes/quotes-table-view";
import { getAllQuotes } from "@/lib/quotes/queries";
import { requireAdmin } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

export const metadata: Metadata = { title: "Quotes | Admin" };

export default async function AdminQuotesPage() {
  const [me, quotes] = await Promise.all([requireAdmin(), getAllQuotes()]);
  return <QuotesTableView quotes={quotes} canDelete={can(me.role, "quotes.delete")} />;
}
