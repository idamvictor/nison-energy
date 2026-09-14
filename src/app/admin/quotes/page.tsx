import type { Metadata } from "next";

import { QuotesTableView } from "@/components/admin/quotes/quotes-table-view";
import { getAllQuotes } from "@/lib/quotes/queries";

export const metadata: Metadata = { title: "Quotes | Admin" };

export default async function AdminQuotesPage() {
  const quotes = await getAllQuotes();
  return <QuotesTableView quotes={quotes} />;
}
