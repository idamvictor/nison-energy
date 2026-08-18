"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { products, type Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const priceBuckets = [
  { key: "under-1000", label: "Under £1,000", test: (p: number) => p < 1000 },
  { key: "1000-1060", label: "£1,000 – £1,060", test: (p: number) => p >= 1000 && p < 1060 },
  { key: "1060-plus", label: "£1,060+", test: (p: number) => p >= 1060 },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const filterKeys = [
  "brand",
  "price",
  "connection",
  "cable",
  "colour",
  "power",
];

function useCounts<T extends string>(values: T[]) {
  return useMemo(() => {
    const counts = new Map<T, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return counts;
  }, [values]);
}

function toggle<T>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function HomeChargingCatalog() {
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [connectionTypes, setConnectionTypes] = useState<Set<string>>(
    new Set()
  );
  const [cableLengths, setCableLengths] = useState<Set<string>>(new Set());
  const [colours, setColours] = useState<Set<string>>(new Set());
  const [powerOutputs, setPowerOutputs] = useState<Set<string>>(new Set());
  const [buckets, setBuckets] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortValue>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const brandCounts = useCounts(products.map((p) => p.brand));
  const connectionCounts = useCounts(products.map((p) => p.connectionType));
  const colourCounts = useCounts(products.map((p) => p.colour));
  const powerCounts = useCounts(products.map((p) => p.powerOutput));
  const cableLengthCounts = useCounts(
    products.filter((p) => p.cableLength).map((p) => p.cableLength as string)
  );
  const bucketCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const bucket of priceBuckets) {
      counts.set(
        bucket.key,
        products.filter((p) => bucket.test(p.price)).length
      );
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p: Product) => {
      if (brands.size > 0 && !brands.has(p.brand)) return false;
      if (connectionTypes.size > 0 && !connectionTypes.has(p.connectionType))
        return false;
      if (
        cableLengths.size > 0 &&
        (!p.cableLength || !cableLengths.has(p.cableLength))
      )
        return false;
      if (colours.size > 0 && !colours.has(p.colour)) return false;
      if (powerOutputs.size > 0 && !powerOutputs.has(p.powerOutput))
        return false;
      if (
        buckets.size > 0 &&
        !priceBuckets.some((b) => buckets.has(b.key) && b.test(p.price))
      )
        return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

    return list;
  }, [
    brands,
    connectionTypes,
    cableLengths,
    colours,
    powerOutputs,
    buckets,
    sort,
  ]);

  const filterGroups = (
    <Accordion multiple defaultValue={filterKeys}>
      <FilterGroup
        value="brand"
        title="Brand"
        items={[...brandCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={brands}
        onToggle={(v) => setBrands((s) => toggle(s, v))}
      />
      <FilterGroup
        value="price"
        title="Price"
        items={priceBuckets.map((b) => ({
          value: b.key,
          label: b.label,
          count: bucketCounts.get(b.key) ?? 0,
        }))}
        selected={buckets}
        onToggle={(v) => setBuckets((s) => toggle(s, v))}
      />
      <FilterGroup
        value="colour"
        title="Colour"
        items={[...colourCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={colours}
        onToggle={(v) => setColours((s) => toggle(s, v))}
      />
      <FilterGroup
        value="connection"
        title="Connection Type"
        items={[...connectionCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={connectionTypes}
        onToggle={(v) => setConnectionTypes((s) => toggle(s, v))}
      />
      <FilterGroup
        value="cable"
        title="Cable Length"
        items={[...cableLengthCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={cableLengths}
        onToggle={(v) => setCableLengths((s) => toggle(s, v))}
      />
      <FilterGroup
        value="power"
        title="Power Output"
        items={[...powerCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={powerOutputs}
        onToggle={(v) => setPowerOutputs((s) => toggle(s, v))}
      />
    </Accordion>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block">
            {filterGroups}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                {filtered.length}{" "}
                {filtered.length === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger
                    render={
                      <Button variant="outline" size="sm" className="gap-1.5 lg:hidden" />
                    }
                  >
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

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortValue)}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Sort products"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No chargers match those filters. Try clearing one or two.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product, index) => (
                  <Reveal key={product.id} delay={(index % 3) * 60}>
                    <ProductCard product={product} />
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

function FilterGroup({
  value,
  title,
  items,
  selected,
  onToggle,
}: {
  value: string;
  title: string;
  items: { value: string; label: string; count: number }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="font-heading text-sm font-semibold text-foreground hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-2.5">
          {items.map(({ value: itemValue, label, count }) => (
            <label
              key={itemValue}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground/80">
                <input
                  type="checkbox"
                  checked={selected.has(itemValue)}
                  onChange={() => onToggle(itemValue)}
                  className="size-4 accent-primary"
                />
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
