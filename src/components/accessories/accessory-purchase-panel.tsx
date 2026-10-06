"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";

import type { AccessoryProduct } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/lib/cart/store";
import { ExpressCheckoutBox } from "@/components/checkout/express-checkout-box";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

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

  const total = product.price * quantity;
  const totalExVat = Math.round((total / 1.2) * 100) / 100;

  const variantSiblings =
    siblings.length > 0 ? siblings : [product];
  // Phase is a real product distinction (different cable spec/price), not a
  // cosmetic one — never offer a colour/length choice that would silently
  // swap the customer onto a different-phase cable.
  const phaseSiblings = variantSiblings.filter((p) => p.phase === product.phase);
  // One entry per distinct colour.
  const colourOptions = phaseSiblings.filter(
    (p, i) => phaseSiblings.findIndex((q) => q.colour === p.colour) === i,
  );
  // Lengths available for the currently selected style+colour, shortest
  // first — each length is now its own real product row. Rows with no
  // recorded length (e.g. adaptors) are excluded so they don't render as
  // a blank option.
  const lengthSiblings = phaseSiblings
    .filter(
      (p) => p.style === product.style && p.colour === product.colour && p.lengthOptions[0],
    )
    .sort(
      (a, b) => parseFloat(a.lengthOptions[0] ?? "0") - parseFloat(b.lengthOptions[0] ?? "0"),
    );
  // No lengths — hide the Length field and let Colour take the full row.
  const hasLengths = lengthSiblings.length > 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border p-5">
      <div>
        <p className="text-3xl font-semibold text-foreground">
          {formatCurrency(total)}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            inc VAT
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(totalExVat)} <span>ex VAT</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label
          className={cn(
            "flex flex-col gap-1.5 text-sm font-medium text-foreground",
            !hasLengths && "sm:col-span-2",
          )}
        >
          Colour
          <select
            value={product.colour}
            onChange={(e) => {
              const candidates = phaseSiblings.filter((p) => p.colour === e.target.value);
              const sameStyle = candidates.filter((p) => p.style === product.style);
              const match =
                sameStyle.find((p) => p.lengthOptions[0] === product.lengthOptions[0]) ??
                sameStyle[0] ??
                candidates[0];
              if (match) router.push(`/accessories/${match.id}`, { scroll: false });
            }}
            className={selectClass}
          >
            {colourOptions.map((p) => (
              <option key={p.colour} value={p.colour}>
                {p.colour}
              </option>
            ))}
          </select>
        </label>

        {hasLengths && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Length
            <select
              value={product.id}
              onChange={(e) =>
                router.push(`/accessories/${e.target.value}`, { scroll: false })
              }
              className={selectClass}
            >
              {lengthSiblings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lengthOptions[0]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>


      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-1.5">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
        </div>
      </div>

      <Button
        size="lg"
        variant="cta"
        className="h-12 w-full gap-1.5 text-base"
        onClick={() => {
          addItem(
            {
              id: product.id,
              category: "accessories",
              name: product.name,
              brand: product.brand,
              image: product.image,
              price: product.price,
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

      <ExpressCheckoutBox
        label="Or buy now with"
        keepCart
        lines={[
          {
            productId: product.id,
            category: "accessories",
            name: product.name,
            unitPrice: product.price,
            quantity,
          },
        ]}
      />

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
