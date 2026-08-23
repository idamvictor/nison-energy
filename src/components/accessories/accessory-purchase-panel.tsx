"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";

import {
  accessoryProducts,
  type AccessoryProduct,
} from "@/lib/accessory-products";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AccessoryPurchasePanel({
  product,
}: {
  product: AccessoryProduct;
}) {
  const router = useRouter();
  const [length, setLength] = useState(product.lengthOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const variantSiblings = accessoryProducts.filter(
    (p) => p.variantGroup === product.variantGroup
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
            value={product.id}
            onChange={(e) => router.push(`/accessories/${e.target.value}`)}
            className={selectClass}
          >
            {variantSiblings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.style} · {p.colour}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Length
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className={selectClass}
          >
            {product.lengthOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
          addItem(product.id, "accessories", quantity);
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
