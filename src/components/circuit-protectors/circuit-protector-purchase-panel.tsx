"use client";

import { useState } from "react";
import { Check, Heart } from "lucide-react";

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

/** Circuit protectors: one fixed unit per product — no colour, length or installation choice. */
export function CircuitProtectorPurchasePanel({ product }: { product: CircuitProtectorProduct }) {
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
        <p className="text-3xl font-semibold text-foreground">
          {formatCurrency(total)}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">inc VAT</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(totalExVat)} <span>ex VAT</span>
        </p>
        {sale && (
          <div className="mt-2 flex items-center gap-2">
            <WasPrice amount={total + saleOff} className="text-base" />
            <SaleBadge sale={{ was: total + saleOff, off: saleOff }} />
          </div>
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
