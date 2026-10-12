import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PriceReviewEditor } from "@/components/price-review/price-review-editor";
import { getPriceList, getReviewWindow } from "@/lib/pricing-review/queries";

export const metadata: Metadata = {
  title: "Price review | Ocunio Energy",
  robots: { index: false, follow: false },
};
// Open/closed is switched in admin — check on every request, never cache.
export const dynamic = "force-dynamic";

export default async function PriceReviewPage() {
  const reviewWindow = await getReviewWindow();
  if (!reviewWindow.open) redirect("/");

  const rows = await getPriceList();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#eef2f4]">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Ocunio Energy home">
            <Image src="/ocunio-energy-logo.png" alt="Ocunio Energy" width={676} height={369} className="h-9 w-auto" />
          </Link>
          <span className="text-sm font-medium text-muted-foreground">Price review</span>
        </div>
      </header>
      <main className="flex-1">
        <PriceReviewEditor rows={rows} />
      </main>
    </div>
  );
}
