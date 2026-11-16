"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";

import { keepScrollOnNextNav } from "@/components/shared/scroll-manager";

import type { CircuitProtectorProduct } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/lib/cart/store";
import { ExpressCheckoutBox } from "@/components/checkout/express-checkout-box";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { saleOf } from "@/lib/catalog/sale";
import { SaleBadge, WasPrice } from "@/components/shared/sale-price";
import { InstalmentsMessage } from "@/components/shared/instalments-message";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const ratingOf = (p: CircuitProtectorProduct) => p.filters.current?.[0] ?? p.name;

/**
 * Circuit protectors: one fixed unit per product, no installation choice. When
 * a product comes in several ratings (same variantGroup), a Rating picker
 * swaps to that rating's page in place.
 */
export function CircuitProtectorPurchasePanel({
  product,
  siblings = [product],
}: {
  product: CircuitProtectorProduct;
  /** Every rating in the same variantGroup, including this one. */
  siblings?: CircuitProtectorProduct[];
}) {
  const router = useRouter();
  const ratings = [...siblings].sort((a, b) => parseFloat(ratingOf(a)) - parseFloat(ratingOf(b)));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const total = product.price * quantity;

  // On sale: the saving scales with quantity (installation isn't discounted).

  const sale = saleOf(product.price, product.compareAtPrice);

  const saleOff = sale ? Math.round(sale.off * quantity * 100) / 100 : 0;
  const totalExVat = Math.round((total / 1.2) * 100) / 100;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border p-5">
      <div>
        {/* Trade product: ex VAT first. */}
        <p className="text-3xl font-semibold text-foreground">
          {formatCurrency(totalExVat)}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">ex VAT</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(total)} <span>inc VAT</span>
        </p>
        {sale && (
          <div className="mt-2 flex items-center gap-2">
            <WasPrice amount={Math.round(((total + saleOff) / 1.2) * 100) / 100} className="text-base" />
            <SaleBadge sale={sale} />
          </div>
        )}
      </div>

      {ratings.length > 1 && (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Rating
          <select
            value={product.id}
            onChange={(e) => {
              keepScrollOnNextNav();
              router.push(`/circuit-protection/${e.target.value}`, { scroll: false });
            }}
            className={selectClass}
          >
            {ratings.map((p) => (
              <option key={p.id} value={p.id}>
                {ratingOf(p)}
              </option>
            ))}
          </select>
        </label>
      )}

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
              category: "circuit-protectors",
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
        eager
        label="Or buy now with"
        keepCart
        lines={[
          {
            productId: product.id,
            category: "circuit-protectors",
            name: product.name,
            unitPrice: product.price,
            quantity,
          },
        ]}
      />
      <InstalmentsMessage amount={total} className="mt-1" />

      <button
        type="button"
        onClick={() => toggle(product.id, "circuit-protectors")}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
      >
        <Heart className={cn("size-4", wishlisted ? "fill-accent text-accent" : "fill-none")} />
        {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    </div>
  );
}
