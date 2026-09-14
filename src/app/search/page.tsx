import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { SearchPageInput } from "@/components/search/search-page-input";
import { SearchResultCard } from "@/components/search/search-result-card";
import { searchProducts } from "@/lib/search/queries";

export const metadata: Metadata = {
  title: "Search | Ocunio Energy",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchProducts(query, 40) : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Search
            </h1>
            <SearchPageInput initialQuery={query} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {!query ? (
            <p className="text-sm text-muted-foreground">
              Search by product name, brand, colour, tag, spec or feature.
            </p>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-base font-medium text-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different word, or browse{" "}
                <Link href="/home-charging" className="text-primary hover:underline">
                  Home Charging
                </Link>
                ,{" "}
                <Link href="/workplace-charging" className="text-primary hover:underline">
                  Workplace Charging
                </Link>{" "}
                or{" "}
                <Link href="/accessories" className="text-primary hover:underline">
                  Accessories
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;
                {query}&rdquo;
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
