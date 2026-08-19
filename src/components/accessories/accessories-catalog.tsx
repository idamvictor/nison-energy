"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { accessoryProducts, type AccessoryProduct } from "@/lib/accessory-products";
import { AccessoryProductCard } from "@/components/accessories/accessory-product-card";
import { Reveal } from "@/components/shared/reveal";
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

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const filterKeys = ["colour", "style", "phase", "length"];

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

export function AccessoriesCatalog() {
  const [colours, setColours] = useState<Set<string>>(new Set());
  const [styles, setStyles] = useState<Set<string>>(new Set());
  const [phases, setPhases] = useState<Set<string>>(new Set());
  const [lengths, setLengths] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortValue>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const colourCounts = useCounts(accessoryProducts.map((p) => p.colour));
  const styleCounts = useCounts(accessoryProducts.map((p) => p.style));
  const phaseCounts = useCounts(accessoryProducts.map((p) => p.phase));
  const lengthCounts = useCounts(
    accessoryProducts.flatMap((p) => p.lengthOptions)
  );

  const filtered = useMemo(() => {
    let list = accessoryProducts.filter((p: AccessoryProduct) => {
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
  }, [colours, styles, phases, lengths, sort]);

  const filterGroups = (
    <Accordion multiple defaultValue={filterKeys}>
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
        items={[...lengthCounts.entries()].map(([value, count]) => ({
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
                No accessories match those filters. Try clearing one or two.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product, index) => (
                  <Reveal key={product.id} delay={(index % 3) * 60}>
                    <AccessoryProductCard product={product} />
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
