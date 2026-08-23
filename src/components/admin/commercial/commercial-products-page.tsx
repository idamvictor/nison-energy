"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Package, Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommercialProductTable } from "@/components/admin/commercial/commercial-product-table";
import { commercialProducts } from "@/lib/commercial-products";

export function CommercialProductsPage() {
  const [query, setQuery] = useState("");

  const filtered = commercialProducts.filter((item) => {
    if (query.trim() === "") return true;
    const q = query.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Package className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Commercial Chargers
            </h2>
            <p className="text-sm text-muted-foreground">
              {commercialProducts.length} workplace chargers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href="/workplace-charging" target="_blank" />}
          >
            <ArrowUpRight />
            View storefront
          </Button>
          <Button render={<Link href="/admin/commercial/new" />}>
            <Plus />
            Add product
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commercial chargers…"
          className="pl-8"
        />
      </div>

      <CommercialProductTable items={filtered} />
    </div>
  );
}
