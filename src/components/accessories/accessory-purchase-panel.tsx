"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";

import type { AccessoryProduct } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/lib/cart/store";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AccessoryPurchasePanel({
  product,
  siblings,
}: {
  product: AccessoryProduct;
  siblings: AccessoryProduct[];
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const variantSiblings =
    siblings.length > 0 ? siblings : [product];
  // One entry per distinct (style, colour) pair.
  const styleColourOptions = variantSiblings.filter(
    (p, i) =>
      variantSiblings.findIndex((q) => q.style === p.style && q.colour === p.colour) === i,
  );
  // Lengths available for the currently selected style+colour, shortest
  // first — each length is now its own real product row.
  const lengthSiblings = variantSiblings
    .filter((p) => p.style === product.style && p.colour === product.colour)
    .sort(
      (a, b) => parseFloat(a.lengthOptions[0] ?? "0") - parseFloat(b.lengthOptions[0] ?? "0"),
    );

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border p-5">
      <div>
        <p className="text-2xl font-semibold text-foreground">
          Request a quote
        </p>
        <p className="text-sm text-muted-foreground">
          Priced per length — get in touch for a fast quote.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Style / colour
          <select
            value={`${product.style}::${product.colour}`}
            onChange={(e) => {
              const [newStyle, newColour] = e.target.value.split("::");
              const candidates = variantSiblings.filter(
                (p) => p.style === newStyle && p.colour === newColour,
              );
              const match =
                candidates.find((p) => p.lengthOptions[0] === product.lengthOptions[0]) ??
                candidates[0];
              if (match) router.push(`/accessories/${match.id}`);
            }}
            className={selectClass}
          >
            {styleColourOptions.map((p) => (
              <option key={`${p.style}::${p.colour}`} value={`${p.style}::${p.colour}`}>
                {p.style} · {p.colour}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Length
          {lengthSiblings.length > 0 ? (
            <select
              value={product.id}
              onChange={(e) => router.push(`/accessories/${e.target.value}`)}
              className={selectClass}
            >
              {lengthSiblings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lengthOptions[0]}
                </option>
              ))}
            </select>
          ) : (
            <select value="na" disabled className={cn(selectClass, "text-muted-foreground")}>
              <option value="na">N/A</option>
            </select>
          )}
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-1.5">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
        </div>
      </div>

      <Button
        size="lg"
        className="h-12 w-full gap-1.5 bg-accent text-base text-accent-foreground hover:bg-accent/90"
        onClick={() => {
          addItem(
            {
              id: product.id,
              category: "accessories",
              name: product.name,
              brand: product.brand,
              image: product.image,
              price: null,
            },
            quantity,
          );
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2000);
        }}
      >
        {added ? (
          <>
            <Check className="size-4" />
            Added to cart
          </>
        ) : (
          "Add to Cart"
        )}
      </Button>

      <button
        type="button"
        onClick={() => toggle(product.id, "accessories")}
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
