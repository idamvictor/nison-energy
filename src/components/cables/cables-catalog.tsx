"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CableProduct, CableType } from "@/lib/catalog/types";
import { cableTypes, cableTypeSlug } from "@/lib/catalog/types";
import { useSortParam } from "@/components/shared/filter-group";
import { CableCard } from "@/components/cables/cable-card";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const cheapest = (group: CableProduct[]) => Math.min(...group.map((p) => p.price));

/** /cables: All · Meter Tails · EV Ultra Install Kit (the ?type= menu links), one card per family. */
export function CablesCatalog({ products }: { products: CableProduct[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const typeSlug = searchParams.get("type");
  const activeType = cableTypes.find((t) => cableTypeSlug[t] === typeSlug) ?? null;
  const [sort, setSort] = useSortParam<SortValue>("featured");

  const setType = (type: CableType | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) params.set("type", cableTypeSlug[type]);
    else params.delete("type");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Meter tail packs sharing a variantGroup show as one card.
  const groups = useMemo(() => {
    const byFamily = new Map<string, CableProduct[]>();
    for (const p of products) {
      if (activeType && p.type !== activeType) continue;
      const key = p.variantGroup || p.id;
      byFamily.set(key, [...(byFamily.get(key) ?? []), p]);
    }
    const list = [...byFamily.values()];
    if (sort === "price-asc") list.sort((a, b) => cheapest(a) - cheapest(b));
    if (sort === "price-desc") list.sort((a, b) => cheapest(b) - cheapest(a));
    return list;
  }, [products, activeType, sort]);

  const tabs: { label: string; type: CableType | null }[] = [
    { label: "All", type: null },
    ...cableTypes.map((type) => ({ label: type, type })),
  ];

  return (
    <section className="bg-background">
      <div id="catalog-results" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Cable type" className="flex flex-wrap gap-2">
            {tabs.map(({ label, type }) => {
              const active = type === activeType;
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setType(type)}
                  className={cn(
                    "h-9 rounded-full px-4 text-sm font-medium ring-1 transition-colors",
                    active
                      ? "bg-foreground text-background ring-foreground"
                      : "bg-background text-foreground/75 ring-border hover:bg-secondary",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-sm text-muted-foreground">
              {groups.length} {groups.length === 1 ? "product" : "products"}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              aria-label="Sort products"
              className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {groups.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <CableCard key={group[0].variantGroup || group[0].id} variants={group} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground">New cable products are coming soon.</p>
        )}
      </div>
    </section>
  );
}
