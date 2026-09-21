"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import type { AccessoryProduct } from "@/lib/catalog/types";
import { AccessoryProductCard } from "@/components/accessories/accessory-product-card";
import { AccessoryCompareBar } from "@/components/accessories/accessory-compare-bar";
import { AccessoryCompareDialog } from "@/components/accessories/accessory-compare-dialog";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterGroup, useCounts, toggle } from "@/components/shared/filter-group";
import { brandLogos } from "@/lib/content/brand-logos";
import { groupByVariant } from "@/lib/catalog/variant-grouping";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const filterKeys = ["brand", "colour", "style", "phase", "length"];

export function AccessoriesCatalog({
  products: accessoryProducts,
}: {
  products: AccessoryProduct[];
}) {
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [colours, setColours] = useState<Set<string>>(new Set());
  const [styles, setStyles] = useState<Set<string>>(new Set());
  const [phases, setPhases] = useState<Set<string>>(new Set());
  const [lengths, setLengths] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortValue>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((c) => c !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const brandCounts = useCounts(accessoryProducts.map((p) => p.brand));
  const colourCounts = useCounts(accessoryProducts.map((p) => p.colour));
  const styleCounts = useCounts(accessoryProducts.map((p) => p.style));
  const phaseCounts = useCounts(accessoryProducts.map((p) => p.phase));
  const lengthCounts = useCounts(
    accessoryProducts.flatMap((p) => p.lengthOptions)
  );

  const filtered = useMemo(() => {
    let list = accessoryProducts.filter((p: AccessoryProduct) => {
      if (brands.size > 0 && !brands.has(p.brand)) return false;
      if (colours.size > 0 && !colours.has(p.colour)) return false;
      if (styles.size > 0 && !styles.has(p.style)) return false;
      if (phases.size > 0 && !phases.has(p.phase)) return false;
      if (
        lengths.size > 0 &&
        !p.lengthOptions.some((length) => lengths.has(length))
      )
        return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [accessoryProducts, brands, colours, styles, phases, lengths, sort]);

  const groups = useMemo(
    () => groupByVariant(filtered, (p) => p.style),
    [filtered]
  );

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
        logos={brandLogos}
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
        value="style"
        title="Style"
        items={[...styleCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={styles}
        onToggle={(v) => setStyles((s) => toggle(s, v))}
      />
      <FilterGroup
        value="phase"
        title="Phase"
        items={[...phaseCounts.entries()].map(([value, count]) => ({
          value,
          label: value,
          count,
        }))}
        selected={phases}
        onToggle={(v) => setPhases((s) => toggle(s, v))}
      />
      <FilterGroup
        value="length"
        title="Length"
        items={[...lengthCounts.entries()]
          .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
          .map(([value, count]) => ({
            value,
            label: value,
            count,
          }))}
        selected={lengths}
        onToggle={(v) => setLengths((s) => toggle(s, v))}
      />
    </Accordion>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {filterGroups}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                {groups.length}{" "}
                {groups.length === 1 ? "product" : "products"}
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

            {groups.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                No accessories match those filters. Try clearing one or two.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-7 pb-20 sm:grid-cols-2 xl:grid-cols-3">
                {groups.map((group, index) => (
                  <Reveal key={group.key} delay={(index % 3) * 60}>
                    <AccessoryProductCard
                      variants={group.variants}
                      compareIds={compareIds}
                      onToggleCompare={toggleCompare}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AccessoryCompareBar
        products={accessoryProducts}
        productIds={compareIds}
        onRemove={toggleCompare}
        onClear={() => setCompareIds([])}
        onCompare={() => setCompareOpen(true)}
      />
      <AccessoryCompareDialog
        products={accessoryProducts}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        productIds={compareIds}
        onRemove={toggleCompare}
      />
    </section>
  );
}
