"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart, type CartItemOptions, type CartSnapshot } from "@/lib/cart/store";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

// Same round icon button as the wishlist heart beside it.
const iconClass =
  "flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-border transition-colors hover:bg-white";

/**
 * Cart icon on a product card (homepage featured products) (homepage featured products).
 * Accessories go in with one click; chargers first ask "with installation or
 * charger only" — the same cart lines the product-page purchase panels add.
 */
export function QuickAddToCart({
  snapshot,
  charger,
}: {
  snapshot: CartSnapshot;
  /** Set for chargers: their install fee (if any) and cable length. */
  charger?: { installFee?: number; cableLength?: string };
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const add = (price: number, options?: CartItemOptions) => {
    addItem({ ...snapshot, price }, 1, options);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const icon = added ? (
    <Check className="size-4 text-success" />
  ) : (
    <ShoppingCart className="size-4 text-foreground/60" />
  );
  const iconLabel = added ? "Added to cart" : `Add ${snapshot.name} to cart`;

  const price = snapshot.price ?? 0;

  if (!charger) {
    return (
      <button type="button" className={iconClass} onClick={() => add(price)} aria-label={iconLabel} title="Add to cart">
        {icon}
      </button>
    );
  }

  const installFee = charger.installFee ?? 0;
  const cable = charger.cableLength ? { cableLength: charger.cableLength } : {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(iconClass, "data-popup-open:bg-white")}
        aria-label={iconLabel}
        title="Add to cart"
      >
        {icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Add to cart</DropdownMenuLabel>
          {installFee > 0 && (
            <DropdownMenuItem
              className="justify-between px-2.5 py-2"
              onClick={() => add(price + installFee, { ...cable, installation: "standard", installFee })}
            >
              With installation
              <span className="text-xs opacity-80">+{formatCurrency(installFee)}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="justify-between px-2.5 py-2"
            onClick={() => add(price, { ...cable, installation: "none" })}
          >
            Charger only
            <span className="text-xs opacity-80">{formatCurrency(price)}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
