"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { AdminProductRow } from "@/components/admin/catalog/products-view";
import { formatCurrency } from "@/lib/currency";

export type ChargerAdminRow = AdminProductRow & {
  category: "Residential" | "Commercial";
};

const chargerAdminRoute: Record<"Residential" | "Commercial", string> = {
  Residential: "/admin/residential",
  Commercial: "/admin/commercial",
};

export function ChargersView({ products }: { products: ChargerAdminRow[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ProductCategory | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<ChargerAdminRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesType = type === "all" || p.category === type;
      const matchesQuery =
        q === "" || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [products, query, type]);

  function confirmDelete() {
    if (!pendingDelete) return;
    setError(null);
    const { id, category } = pendingDelete;
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
            <Zap className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Chargers</h2>
            <p className="text-sm text-muted-foreground">
              {products.length} residential &amp; commercial chargers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/residential/new" />}
          >
            <Plus />
            Add residential
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/commercial/new" />}>
            <Plus />
            Add commercial
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="pl-8"
          />
        </div>
        <Select
          value={type}
          onValueChange={(value) => value && setType(value as ProductCategory | "all")}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Residential">Residential</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground">Try a different search or type filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Colour</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const adminHref = `${chargerAdminRoute[item.category]}/${item.id}`;
                return (
                  <TableRow key={`${item.category}-${item.id}`}>
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
                            href={adminHref}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.category === "Residential" ? "secondary" : "outline"}>
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.sku ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.colour}</TableCell>
                    <TableCell className="font-heading font-semibold text-primary">
                      {item.price != null ? formatCurrency(item.price) : "—"}
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
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                          <MoreHorizontal />
                          <span className="sr-only">Product actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={adminHref} />}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            render={
                              <Link
                                href={`${categoryRoute[item.category]}/${item.id}`}
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
                );
              })}
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
              Permanently delete &ldquo;{pendingDelete?.name}&rdquo;? This removes it from the
              storefront and cannot be undone.
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
