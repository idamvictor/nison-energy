"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronRight, Lock, PlugZap, Search, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ChargerSelection, GuideCharger } from "@/lib/grant-guide/types";
import { cn } from "@/lib/utils";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

type Category = GuideCharger["category"];
type Sort = "recommended" | "price-asc" | "price-desc";

const categoryLabel: Record<Category, string> = { home: "Home", commercial: "Commercial" };

/** 22kW-class vs 7kW-class — the distinction customers actually shop by. */
function powerClass(powerOutput: string): "7kW" | "22kW" {
  const kw = parseFloat(powerOutput);
  return Number.isFinite(kw) && kw >= 11 ? "22kW" : "7kW";
}

function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground/80 hover:border-primary/60 hover:text-primary-ink",
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn("text-xs", active ? "text-background/70" : "text-muted-foreground")}>
          {count}
        </span>
      )}
    </button>
  );
}

function SpecChips({ charger, className }: { charger: GuideCharger; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground/75">
        {charger.powerOutput}
      </span>
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground/75">
        {charger.connectionType}
      </span>
    </div>
  );
}

function ChargerCard({
  charger,
  selected,
  onPick,
  size = "grid",
}: {
  charger: GuideCharger;
  selected: boolean;
  onPick: () => void;
  size?: "grid" | "feature";
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5 hover:shadow-lg",
        selected
          ? "border-foreground ring-2 ring-primary/40"
          : "border-border hover:border-primary/50",
        size === "feature" ? "w-60 shrink-0 snap-start" : "w-full",
      )}
    >
      {selected && (
        <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">
          <Check className="size-3" />
          Selected
        </span>
      )}
      <div className={cn("relative bg-white", size === "feature" ? "h-36" : "h-32")}>
        <Image
          src={charger.image}
          alt=""
          fill
          sizes="240px"
          className="object-contain p-4 transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-border/70 p-3.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {charger.brand}
        </p>
        <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
          {charger.name}
        </p>
        <SpecChips charger={charger} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-sm font-semibold text-accent-strong">
              {charger.variants.length > 1 ? "from " : ""}
              {gbp.format(charger.fromPriceExVat)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">ex VAT</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {gbp.format(charger.variants[0].priceIncVat)} inc VAT
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </button>
  );
}

/**
 * The OZEV guides' charger finder: a selected-charger card in the quote form
 * plus a searchable, filterable dialog over every live home + commercial
 * charger. Price is taken from the product (ex VAT) and not editable.
 */
export function ChargerPicker({
  chargers,
  defaultCategory,
  value,
  onChange,
}: {
  chargers: GuideCharger[];
  defaultCategory: Category;
  value: ChargerSelection | null;
  onChange: (value: ChargerSelection) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [query, setQuery] = useState("");
  const [connection, setConnection] = useState<GuideCharger["connectionType"] | null>(null);
  const [power, setPower] = useState<"7kW" | "22kW" | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("recommended");
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedGroup = value ? chargers.find((c) => c.key === value.key) : undefined;
  const selectedVariant = selectedGroup?.variants.find((v) => v.id === value?.variantId);

  const brandCount = useMemo(() => new Set(chargers.map((c) => c.brand)).size, [chargers]);
  const categoryCounts = useMemo(
    () => ({
      home: chargers.filter((c) => c.category === "home").length,
      commercial: chargers.filter((c) => c.category === "commercial").length,
    }),
    [chargers],
  );

  const inCategory = useMemo(
    () => chargers.filter((c) => c.category === category),
    [chargers, category],
  );

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of inCategory) counts.set(c.brand, (counts.get(c.brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [inCategory]);

  const filtersActive = Boolean(query.trim() || connection || power || brand);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inCategory.filter(
      (c) =>
        (!q ||
          `${c.brand} ${c.name} ${c.powerOutput} ${c.connectionType}`.toLowerCase().includes(q)) &&
        (!connection || c.connectionType === connection) &&
        (!power || powerClass(c.powerOutput) === power) &&
        (!brand || c.brand === brand),
    );
    return list.sort((a, b) => {
      if (sort === "price-asc") return a.fromPriceExVat - b.fromPriceExVat;
      if (sort === "price-desc") return b.fromPriceExVat - a.fromPriceExVat;
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });
  }, [inCategory, query, connection, power, brand, sort]);

  const popular = useMemo(() => inCategory.filter((c) => c.featured), [inCategory]);

  function clearFilters() {
    setQuery("");
    setConnection(null);
    setPower(null);
    setBrand(null);
  }

  function pick(charger: GuideCharger) {
    const keepVariant =
      value?.key === charger.key && charger.variants.some((v) => v.id === value.variantId);
    onChange({ key: charger.key, variantId: keepVariant ? value!.variantId : charger.variants[0].id });
    setOpen(false);
    requestAnimationFrame(() =>
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }

  function openFinder() {
    if (selectedGroup) setCategory(selectedGroup.category);
    setOpen(true);
  }

  // Variant axes for the selected product — only shown when there's a real choice.
  const colours = selectedGroup ? [...new Set(selectedGroup.variants.map((v) => v.colour))] : [];
  const lengths = selectedGroup
    ? [
        ...new Set(
          selectedGroup.variants
            .filter((v) => v.colour === selectedVariant?.colour)
            .map((v) => v.cableLength)
            .filter((l): l is string => Boolean(l)),
        ),
      ]
    : [];

  function chooseVariant(colour: string, length?: string) {
    if (!selectedGroup) return;
    const match =
      selectedGroup.variants.find(
        (v) => v.colour === colour && (length === undefined || v.cableLength === length),
      ) ?? selectedGroup.variants.find((v) => v.colour === colour);
    if (match) onChange({ key: selectedGroup.key, variantId: match.id });
  }

  return (
    <div ref={cardRef} className="scroll-mt-28 sm:col-span-2">
      <p className="mb-1.5 text-sm font-medium text-foreground">Your charger</p>

      {selectedGroup && selectedVariant ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-foreground/15 bg-card p-3 shadow-sm sm:flex-row sm:items-stretch">
          <div className="relative h-36 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-border sm:h-auto sm:w-36">
            <Image
              src={selectedVariant.image || selectedGroup.image}
              alt=""
              fill
              sizes="144px"
              className="object-contain p-3"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {selectedGroup.brand} · {categoryLabel[selectedGroup.category]}
                </p>
                <p className="font-semibold leading-snug text-foreground">{selectedVariant.name}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={openFinder}>
                Change
              </Button>
            </div>
            <SpecChips charger={selectedGroup} />

            {colours.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-muted-foreground">Colour</span>
                {colours.map((c) => (
                  <Chip key={c} active={c === selectedVariant.colour} onClick={() => chooseVariant(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            )}
            {lengths.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-muted-foreground">Cable</span>
                {lengths.map((l) => (
                  <Chip
                    key={l}
                    active={l === selectedVariant.cableLength}
                    onClick={() => chooseVariant(selectedVariant.colour, l)}
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5">
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  {gbp.format(selectedVariant.priceExVat)}
                </span>{" "}
                <span className="text-muted-foreground">
                  ex VAT · {gbp.format(selectedVariant.priceIncVat)} inc VAT
                </span>
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Shop price
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFinder}
          className="group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/60 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <PlugZap className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-foreground">Choose your charger</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Browse {chargers.length} chargers from {brandCount} brands — search, filter and pick
              in seconds.
            </span>
          </span>
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            Browse chargers
            <ChevronRight className="size-4" />
          </span>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[100svh] max-h-[100svh] w-full max-w-full flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[88svh] sm:max-w-5xl sm:rounded-2xl"
        >
          {/* Header: title, search, category toggle */}
          <div className="flex flex-col gap-3 border-b border-border bg-card px-4 pt-4 pb-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-lg font-semibold">Find your charger</DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search chargers</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by brand, model or power — e.g. “Zappi”, “22kW”"
                  className="h-10 rounded-xl bg-background pl-9"
                />
              </label>
              <div role="tablist" aria-label="Charger type" className="grid grid-cols-2 rounded-xl bg-muted p-1">
                {(["home", "commercial"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={category === c}
                    onClick={() => {
                      setCategory(c);
                      setBrand(null);
                    }}
                    className={cn(
                      "h-8 rounded-lg px-4 text-sm font-medium transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      category === c
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {categoryLabel[c]}
                    <span className="ml-1.5 text-xs text-muted-foreground">{categoryCounts[c]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
              {(["Tethered", "Untethered"] as const).map((c) => (
                <Chip key={c} active={connection === c} onClick={() => setConnection(connection === c ? null : c)}>
                  {c}
                </Chip>
              ))}
              <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
              {(["7kW", "22kW"] as const).map((p) => (
                <Chip key={p} active={power === p} onClick={() => setPower(power === p ? null : p)}>
                  {p}
                </Chip>
              ))}
              <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
              {brands.map(([b, n]) => (
                <Chip key={b} active={brand === b} count={n} onClick={() => setBrand(brand === b ? null : b)}>
                  {b}
                </Chip>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-muted/40 px-4 py-5 sm:px-6">
            {!filtersActive && popular.length > 0 && (
              <section className="mb-7">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
                  <Sparkles className="size-3.5" />
                  Popular picks
                </p>
                <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
                  {popular.map((c) => (
                    <ChargerCard
                      key={c.key}
                      charger={c}
                      size="feature"
                      selected={value?.key === c.key}
                      onPick={() => pick(c)}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "charger" : "chargers"}
                {filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-3 font-medium text-foreground underline-offset-4 hover:text-primary-ink hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </p>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Sort
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-8 rounded-lg border border-input bg-card px-2 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {results.map((c) => (
                  <ChargerCard
                    key={c.key}
                    charger={c}
                    selected={value?.key === c.key}
                    onPick={() => pick(c)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
                <PlugZap className="size-8 text-muted-foreground" />
                <p className="font-medium text-foreground">No chargers match those filters</p>
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
