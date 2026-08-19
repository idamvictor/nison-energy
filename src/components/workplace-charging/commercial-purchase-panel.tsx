"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShieldCheck } from "lucide-react";

import {
  commercialProducts,
  type CommercialProduct,
} from "@/lib/commercial-products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CommercialPurchasePanel({
  product,
  warranty,
}: {
  product: CommercialProduct;
  warranty: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const total = product.price * quantity;
  const totalExVat = Math.round(total / 1.2);

  const colourSiblings = product.variantGroup
    ? commercialProducts.filter((p) => p.variantGroup === product.variantGroup)
    : [product];

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border p-5">
      <div>
        <p className="text-3xl font-semibold text-foreground">
          £{total}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            inc VAT
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          £{totalExVat} <span>ex VAT</span> · supply &amp; fit
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Colour / connection
          <select
            value={product.id}
            onChange={(e) =>
              router.push(`/workplace-charging/${e.target.value}`)
            }
            className={selectClass}
          >
            {colourSiblings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.colour} · {p.connectionType}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Cable length
          <select value="10m" disabled className={cn(selectClass, "text-muted-foreground")}>
            <option value="10m">10m (charger to fuse box)</option>
          </select>
        </label>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm text-foreground">{warranty}</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-1.5 flex h-10 w-32 items-stretch overflow-hidden rounded-lg border border-input">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex w-10 items-center justify-center text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Minus className="size-3.5" />
          </button>
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-foreground">
            {quantity}
          </div>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex w-10 items-center justify-center text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <Button
        size="lg"
        className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90"
      >
        Request a quote
      </Button>

      <button
        type="button"
        onClick={() => setWishlisted((w) => !w)}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
      >
        <Heart
          className={cn(
            "size-4",
            wishlisted ? "fill-accent text-accent" : "fill-none"
          )}
        />
        {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    </div>
  );
}
