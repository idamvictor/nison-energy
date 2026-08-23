"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart, resolveCartItem } from "@/hooks/use-cart";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function CartSheet() {
  const isOpen = useCart((s) => s.isOpen);
  const closeCart = useCart((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const lines = items
    .map((item) => resolveCartItem(item))
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotal = lines.reduce(
    (sum, line) => sum + (line.price ?? 0) * line.quantity,
    0
  );
  const hasQuoteOnlyItems = lines.some((line) => line.price === null);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-96 flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="size-5" />
            </span>
            <p className="font-heading text-base font-semibold text-foreground">
              Your cart is empty
            </p>
            <Button nativeButton={false} render={<Link href="/home-charging" />} onClick={closeCart}>
              Browse residential chargers
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="flex flex-col gap-4">
                {lines.map((line) => (
                  <div key={line.id} className="flex gap-3">
                    <Link
                      href={line.href}
                      onClick={closeCart}
                      className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border"
                    >
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={line.href}
                          onClick={closeCart}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {line.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(line.id)}
                          aria-label="Remove item"
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{line.brand}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <QuantityStepper
                          quantity={line.quantity}
                          onChange={(q) => updateQuantity(line.id, q)}
                          className="h-8 w-24"
                        />
                        <p className="text-sm font-semibold text-foreground">
                          {line.price != null
                            ? currency.format(line.price * line.quantity)
                            : "Quote"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-4 pt-4 pb-2">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-foreground">Subtotal</p>
                <p className="font-heading text-lg font-semibold text-foreground">
                  {currency.format(subtotal)}
                </p>
              </div>
              {hasQuoteOnlyItems && (
                <p className="text-xs text-muted-foreground">
                  Accessories are priced per quote — we&apos;ll confirm the
                  full total when we&apos;re in touch.
                </p>
              )}
              <Button
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                nativeButton={false}
                render={<Link href="/checkout" />}
                onClick={closeCart}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/cart" />}
                onClick={closeCart}
              >
                View Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
