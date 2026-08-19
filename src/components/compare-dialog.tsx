"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { products, type Product } from "@/lib/products";
import { productDetails } from "@/lib/product-details";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const rows: { label: string; value: (p: Product) => React.ReactNode }[] = [
  { label: "Price", value: (p) => `£${p.price}` },
  { label: "Brand", value: (p) => p.brand },
  { label: "Connection type", value: (p) => p.connectionType },
  { label: "Cable length", value: (p) => p.cableLength ?? "—" },
  { label: "Colour", value: (p) => p.colour },
  { label: "Power output", value: (p) => p.powerOutput },
  {
    label: "Warranty",
    value: (p) => productDetails[p.id]?.warranty ?? "—",
  },
];

export function CompareDialog({
  open,
  onOpenChange,
  productIds,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
  onRemove: (id: string) => void;
}) {
  const selected = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compare chargers</DialogTitle>
        </DialogHeader>

        {selected.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Select at least two chargers to compare.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[560px] gap-x-4"
              style={{
                gridTemplateColumns: `120px repeat(${selected.length}, 1fr)`,
              }}
            >
              <div />
              {selected.map((product) => (
                <div key={product.id} className="flex flex-col items-center gap-2 pb-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remove ${product.name} from comparison`}
                    className="self-end rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-border">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <p className="text-xs leading-snug font-semibold text-foreground">
                    {product.name}
                  </p>
                </div>
              ))}

              {rows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="flex items-center border-t border-border py-3 text-xs font-medium text-muted-foreground">
                    {row.label}
                  </div>
                  {selected.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-center border-t border-border py-3 text-center text-sm text-foreground"
                    >
                      {row.value(product)}
                    </div>
                  ))}
                </div>
              ))}

              <div />
              {selected.map((product) => (
                <div key={product.id} className="flex justify-center pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    className="border-primary/25 text-primary hover:bg-primary/5"
                    render={<Link href={`/home-charging/${product.id}`} />}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
