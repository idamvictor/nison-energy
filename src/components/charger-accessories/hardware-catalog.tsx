"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import type { HardwareProduct } from "@/lib/catalog/types";
import { HardwareCard } from "@/components/charger-accessories/hardware-card";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterGroup, toggle, useFilterParam, useSortParam } from "@/components/shared/filter-group";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

/** Colour variants (same variantGroup) collapse into one card. */
function groupVariants(products: HardwareProduct[]): HardwareProduct[][] {
  const groups = new Map<string, HardwareProduct[]>();
  for (const p of products) {
    const key = p.variantGroup || p.id;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()];
}

const minPrice = (group: HardwareProduct[]) => Math.min(...group.map((p) => p.price));

/** The Covers / Mounts & Posts grid: brand filter (sheet on mobile) and a price sort. */
export function HardwareCatalog({ products }: { products: HardwareProduct[] }) {
  const [brands, setBrands] = useFilterParam("brand");
  const [sort, setSort] = useSortParam<SortValue>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const allGroups = useMemo(() => groupVariants(products), [products]);

  const brandCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const group of allGroups) counts.set(group[0].brand, (counts.get(group[0].brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [allGroups]);

  const groups = useMemo(() => {
    const list = allGroups.filter((g) => brands.size === 0 || brands.has(g[0].brand));
    if (sort === "featured") return list;
    return [...list].sort((a, b) => (sort === "price-asc" ? minPrice(a) - minPrice(b) : minPrice(b) - minPrice(a)));
  }, [allGroups, brands, sort]);

  const showFilters = brandCounts.length > 1;
  const filterGroups = (
    <Accordion multiple defaultValue={["brand"]}>
      <FilterGroup
        value="brand"
        title="Brand"
        items={brandCounts.map(([value, count]) => ({ value, label: value, count }))}
        selected={brands}
        onToggle={(v) => setBrands((s) => toggle(s, v))}
      />
    </Accordion>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {showFilters && (
            <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              {filterGroups}
            </aside>
          )}

          <div id="catalog-results" className="min-w-0 flex-1 scroll-mt-24">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                {groups.length} {groups.length === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                {showFilters && (
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5 lg:hidden" />}>
                      <SlidersHorizontal className="size-3.5" />
                      Filters
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="px-4 pb-6">{filterGroups}</div>
                    </SheetContent>
                  </Sheet>
                )}
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

            {groups.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                {products.length === 0 ? "New products are coming soon." : "Nothing matches those filters."}
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-7 pb-20 sm:grid-cols-2 xl:grid-cols-3">
                {groups.map((group, index) => (
                  <Reveal key={group[0].variantGroup || group[0].id} delay={(index % 3) * 60}>
                    <HardwareCard variants={group} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
