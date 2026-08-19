"use client";

import Image from "next/image";
import { Scale, X } from "lucide-react";

import { accessoryProducts, type AccessoryProduct } from "@/lib/accessory-products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessoryCompareBar({
  productIds,
  onRemove,
  onClear,
  onCompare,
}: {
  productIds: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  const selected = productIds
    .map((id) => accessoryProducts.find((p) => p.id === id))
    .filter((p): p is AccessoryProduct => Boolean(p));

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out",
        selected.length > 0 ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur-sm">
          <div className="flex flex-1 items-center gap-2">
            {selected.map((product) => (
              <div key={product.id} className="relative">
                <div className="size-11 overflow-hidden rounded-lg bg-white ring-1 ring-border">
                  <div className="relative size-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  aria-label={`Remove ${product.name}`}
                  className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-background"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              {selected.length} of 3 selected
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
            <Button
              size="sm"
              disabled={selected.length < 2}
              onClick={onCompare}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Scale className="size-3.5" />
              Compare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
