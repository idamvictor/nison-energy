"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { categoryRoute } from "@/lib/catalog/types";
import type { SearchResult } from "@/lib/search/types";
import { formatCurrency } from "@/lib/currency";

const categoryLabel: Record<SearchResult["category"], string> = {
  Residential: "Home Charging",
  Commercial: "Workplace Charging",
  Accessory: "Accessory",
};

export function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 2) {
      queueMicrotask(() => {
        setResults([]);
        setLoading(false);
      });
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`)
        .then((res) => res.json())
        .then((data: { results: SearchResult[] }) => setResults(data.results))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function goToResults() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4.5" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setValue("");
            setResults([]);
          }
        }}
      >
        <DialogContent className="top-24 max-w-lg translate-y-0 gap-3 sm:max-w-lg">
        <DialogTitle>Search</DialogTitle>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          {loading && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToResults();
              }
            }}
            placeholder="Search chargers, accessories, brands, specs…"
            className="pl-9"
          />
        </div>

        {value.trim().length >= 2 && (
          <div className="flex max-h-96 flex-col gap-1 overflow-y-auto">
            {results.length === 0 && !loading && (
              <p className="px-1 py-4 text-center text-sm text-muted-foreground">
                No results for &ldquo;{value.trim()}&rdquo;
              </p>
            )}
            {results.map((result) => (
              <Link
                key={result.id}
                href={`${categoryRoute[result.category]}/${result.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border">
                  <Image
                    src={result.image}
                    alt={result.name}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {result.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[0.65rem]">
                      {categoryLabel[result.category]}
                    </Badge>
                    <span className="truncate text-xs text-muted-foreground">
                      {result.brand}
                    </span>
                  </div>
                </div>
                {result.price != null && (
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {formatCurrency(result.price)}
                  </span>
                )}
              </Link>
            ))}
            {results.length > 0 && (
              <button
                type="button"
                onClick={goToResults}
                className="flex items-center justify-between rounded-lg p-2 text-sm font-medium text-primary hover:bg-muted"
              >
                See all results for &ldquo;{value.trim()}&rdquo;
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        )}
        </DialogContent>
      </Dialog>
    </>
  );
}
