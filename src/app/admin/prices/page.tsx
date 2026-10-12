import type { Metadata } from "next";

import { PriceListView } from "@/components/admin/prices/price-list-view";
import { getPendingSubmissions, getPriceList, getReviewWindow } from "@/lib/pricing-review/queries";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Price list | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPricesPage() {
  const [rows, reviewWindow, submissions] = await Promise.all([
    getPriceList(),
    getReviewWindow(),
    getPendingSubmissions(),
  ]);
  return (
    <PriceListView
      rows={rows}
      reviewWindow={reviewWindow}
      submissions={submissions}
      reviewUrl={`${SITE_URL}/price-review`}
    />
  );
}
