"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { CircuitProtectorCard } from "@/components/circuit-protectors/circuit-protector-card";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterGroup, toggle, useSortParam } from "@/components/shared/filter-group";
import { CIRCUIT_PROTECTOR_FILTERS } from "@/lib/catalog/circuit-protector-filters";
import type { CircuitProtectorProduct } from "@/lib/catalog/types";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const filterKeys = CIRCUIT_PROTECTOR_FILTERS.map((f) => f.key);

/**
 * Every filter's ticked values, read from / written to the URL (one query
 * param per filter key, comma separated) — same behaviour as useFilterParam,
 * but for the whole set of filters at once.
 */
function useCircuitFilterParams(): [
  Record<string, Set<string>>,
  (key: string, value: string) => void,
  () => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = useMemo(() => {
    const out: Record<string, Set<string>> = {};
    for (const key of filterKeys) {
      const raw = searchParams.get(key);
      out[key] = raw ? new Set(raw.split(",")) : new Set();
    }
    return out;
  }, [searchParams]);

  const replace = (params: URLSearchParams) => {
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    requestAnimationFrame(() => {
      const el = document.getElementById("catalog-results");
      if (el && el.getBoundingClientRect().top < 95) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  };

  const toggleValue = (key: string, value: string) => {
    const next = toggle(selected[key], value);
    const params = new URLSearchParams(searchParams.toString());
    if (next.size > 0) params.set(key, [...next].join(","));
    else params.delete(key);
    replace(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of filterKeys) params.delete(key);
    replace(params);
  };

  return [selected, toggleValue, clearAll];
}

/** A product matches when, for every filter with ticks, it has at least one ticked value. */
function matches(product: CircuitProtectorProduct, selected: Record<string, Set<string>>, skipKey?: string) {
  return filterKeys.every((key) => {
    if (key === skipKey || selected[key].size === 0) return true;
    return (product.filters[key] ?? []).some((v) => selected[key].has(v));
  });
}

/** The circuit protector grid with a filter sidebar (sheet on mobile) and a price sort. */
export function CircuitProtectorCatalog({ products }: { products: CircuitProtectorProduct[] }) {
  const [selected, toggleValue, clearAll] = useCircuitFilterParams();
  const [sort, setSort] = useSortParam<SortValue>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeCount = filterKeys.reduce((n, key) => n + selected[key].size, 0);

  const filtered = useMemo(() => {
    const list = products.filter((p) => matches(p, selected));
    if (sort === "featured") return list;
    return [...list].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  }, [products, selected, sort]);

  // Each value's count is how many products it would show given the other
  // filters' ticks, so shoppers can see what's left before they click.
  const groups = useMemo(
    () =>
      CIRCUIT_PROTECTOR_FILTERS.map((def) => {
        const pool = products.filter((p) => matches(p, selected, def.key));
        const items = (def.values as readonly string[])
          .map((value) => ({
            value,
            label: value,
            count: pool.filter((p) => (p.filters[def.key] ?? []).includes(value)).length,
          }))
          // Hide values no product has (unless ticked), so nothing shows 0 forever.
          .filter(
            (item) =>
              selected[def.key].has(item.value) ||
              products.some((p) => (p.filters[def.key] ?? []).includes(item.value)),
          );
        return { def, items };
      }).filter((g) => g.items.length > 0),
    [products, selected],
  );

  const filterGroups = (
    <div>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="mb-2 text-sm font-medium text-primary-ink underline-offset-4 hover:underline"
        >
          Clear all filters ({activeCount})
        </button>
      )}
      <Accordion multiple defaultValue={filterKeys}>
        {groups.map(({ def, items }) => (
          <FilterGroup
            key={def.key}
            value={def.key}
            title={def.title}
            items={items}
            selected={selected[def.key]}
            onToggle={(v) => toggleValue(def.key, v)}
          />
        ))}
      </Accordion>
    </div>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {groups.length > 0 && (
            <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              {filterGroups}
            </aside>
          )}

          <div id="catalog-results" className="min-w-0 flex-1 scroll-mt-24">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                {groups.length > 0 && (
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5 lg:hidden" />}>
                      <SlidersHorizontal className="size-3.5" />
                      Filters{activeCount > 0 ? ` (${activeCount})` : ""}
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

            {filtered.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <CircuitProtectorCard key={product.id} variants={[product]} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No products match those filters. Try clearing one or two.
              </p>
            ) : (
              <p className="py-16 text-center text-muted-foreground">New circuit protection products are coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
