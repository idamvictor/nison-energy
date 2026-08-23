"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/product-table";
import {
  catalogCategoryHrefs,
  getCatalogItems,
  type CatalogCategory,
} from "@/lib/admin-catalog";

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
} as const;

export function CategoryProductsPage({
  category,
  title,
  description,
  icon,
  tone,
}: {
  category: CatalogCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: keyof typeof toneClasses;
}) {
  const [query, setQuery] = useState("");
  const items = useMemo(
    () => getCatalogItems().filter((item) => item.category === category),
    [category]
  );

  const filtered = items.filter((item) => {
    if (query.trim() === "") return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
          >
            {icon}
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={catalogCategoryHrefs[category]} target="_blank" />}
          >
            <ArrowUpRight />
            View storefront
          </Button>
          <Button render={<Link href={`/admin/${category}/new`} />}>
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
          placeholder={`Search ${title.toLowerCase()}…`}
          className="pl-8"
        />
      </div>

      <ProductTable category={category} items={filtered} />
    </div>
  );
}
