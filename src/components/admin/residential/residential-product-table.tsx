"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { tagClass } from "@/components/shared/product-tag";
import type { Product } from "@/lib/products";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function ResidentialProductTable({ items }: { items: Product[] }) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const visible = items.filter((item) => !removedIds.has(item.id));

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No products found
        </p>
        <p className="text-sm text-muted-foreground">
          Try a different search.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead>Product</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((item) => (
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
                        href={`/admin/residential/${item.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.brand}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.colour}
                </TableCell>
                <TableCell className="font-heading font-semibold text-primary">
                  {currency.format(item.price)}
                </TableCell>
                <TableCell>
                  {item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} className={tagClass(tag)}>
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="secondary">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
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
                        render={<Link href={`/admin/residential/${item.id}`} />}
                      >
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/home-charging/${item.id}`}
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

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              Remove &ldquo;{pendingDelete?.name}&rdquo; from the catalog
              view? This is a design preview — nothing is persisted, so it
              will reappear on refresh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete) {
                  setRemovedIds((prev) => {
                    const next = new Set(prev);
                    next.add(pendingDelete.id);
                    return next;
                  });
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
