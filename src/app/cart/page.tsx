"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart, resolveCartItem } from "@/hooks/use-cart";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function CartPage() {
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
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Your Cart
          </h1>

          {lines.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Browse our chargers and accessories to get started.
              </p>
              <Button nativeButton={false} render={<Link href="/home-charging" />}>
                Browse residential chargers
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-4">
                {lines.map((line) => (
                  <Card key={line.id}>
                    <CardContent className="flex gap-4">
                      <Link
                        href={line.href}
                        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border"
                      >
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="96px"
                          className="object-contain p-2"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={line.href}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {line.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {line.brand}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-foreground">
                            {line.price != null
                              ? currency.format(line.price * line.quantity)
                              : "Quote"}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <QuantityStepper
                            quantity={line.quantity}
                            onChange={(q) => updateQuantity(line.id, q)}
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(line.id)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="h-fit">
                <CardContent className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Order Summary
                  </h2>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-medium text-foreground">
                      {currency.format(subtotal)}
                    </p>
                  </div>
                  {hasQuoteOnlyItems && (
                    <p className="text-xs text-muted-foreground">
                      Accessories are priced per quote — we&apos;ll confirm
                      the full total when we&apos;re in touch.
                    </p>
                  )}
                  <Button
                    size="lg"
                    className="w-full gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                    nativeButton={false}
                    render={<Link href="/checkout" />}
                  >
                    Proceed to Checkout
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
