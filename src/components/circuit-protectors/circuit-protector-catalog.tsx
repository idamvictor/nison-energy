"use client";

import { useMemo } from "react";

import { CircuitProtectorCard } from "@/components/circuit-protectors/circuit-protector-card";
import { useSortParam } from "@/components/shared/filter-group";
import type { CircuitProtectorProduct } from "@/lib/catalog/types";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

/** The circuit protector grid — a count and a sort, no filter sidebar. */
export function CircuitProtectorCatalog({ products }: { products: CircuitProtectorProduct[] }) {
  const [sort, setSort] = useSortParam<SortValue>("featured");

  const sorted = useMemo(() => {
    if (sort === "featured") return products;
    return [...products].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  }, [products, sort]);

  return (
    <section className="bg-background">
      <div id="catalog-results" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "product" : "products"}
          </p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sorted.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((product) => (
              <CircuitProtectorCard key={product.id} variants={[product]} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground">New circuit protectors are coming soon.</p>
        )}
      </div>
    </section>
  );
}
