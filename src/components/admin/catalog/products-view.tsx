"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Cable,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Zap,
  Package,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryRoute, type ProductCategory } from "@/lib/catalog/types";
import { removeProduct } from "@/lib/catalog/actions";
import { formatCurrency } from "@/lib/currency";

export type AdminProductRow = {
  id: string;
  name: string;
  brand: string;
  sku?: string;
  colour: string;
  image: string;
  tags: string[];
  price?: number;
  style?: string;
  phase?: string;
  active?: boolean;
  featured?: boolean;
};

const meta: Record<
  ProductCategory,
  { title: string; noun: string; icon: typeof Zap; admin: string }
> = {
  Residential: { title: "Residential Chargers", noun: "home chargers", icon: Zap, admin: "/admin/residential" },
  Commercial: { title: "Commercial Chargers", noun: "workplace chargers", icon: Package, admin: "/admin/commercial" },
  Accessory: { title: "Accessories", noun: "charging cables", icon: Cable, admin: "/admin/accessories" },
};

export function ProductsView({
  category,
  products,
}: {
  category: ProductCategory;
  products: AdminProductRow[];
}) {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminProductRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const m = meta[category];
  const Icon = m.icon;
  const isCharger = category !== "Accessory";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  }, [products, query]);

  function confirmDelete() {
    if (!pendingDelete) return;
    setError(null);
    const id = pendingDelete.id;
    startTransition(async () => {
      const result = await removeProduct(category, id);
      setPendingDelete(null);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              {m.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {products.length} {m.noun}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={categoryRoute[category]} target="_blank" />}
          >
            <ArrowUpRight />
            View storefront
          </Button>
          <Button nativeButton={false} render={<Link href={`${m.admin}/new`} />}>
            <Plus />
            Add product
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground">Try a different search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Colour</TableHead>
                <TableHead>{isCharger ? "Price" : "Style / Phase"}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="44px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div>
                        <Link
                          href={`${m.admin}/${item.id}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{item.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.colour}</TableCell>
                  <TableCell className="font-heading font-semibold text-primary">
                    {isCharger
                      ? item.price != null
                        ? formatCurrency(item.price)
                        : "—"
                      : `${item.style ?? "—"} · ${item.phase ?? "—"}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                      {item.featured && <Badge variant="outline">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreHorizontal />
                        <span className="sr-only">Product actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`${m.admin}/${item.id}`} />}
                        >
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`${categoryRoute[category]}/${item.id}`}
                              target="_blank"
                            />
                          }
                        >
                          <ExternalLink />
                          View on site
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setPendingDelete(item)}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              Permanently delete &ldquo;{pendingDelete?.name}&rdquo;? This removes
              it from the storefront and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" disabled={pending} onClick={confirmDelete}>
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
