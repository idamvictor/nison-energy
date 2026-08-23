"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShoppingCart } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, resolveCartItem } from "@/hooks/use-cart";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [submitted, setSubmitted] = useState(false);

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
            Checkout
          </h1>

          {submitted ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="size-6 text-success" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">
                Thanks — we&apos;ve got your order
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                A member of the team will be in touch to confirm payment and
                book your installation. If it&apos;s urgent, call us on 033
                0633 0252.
              </p>
              <Button nativeButton={false} render={<Link href="/" />}>
                Back to home
              </Button>
            </div>
          ) : lines.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">
                Your cart is empty
              </p>
              <Button nativeButton={false} render={<Link href="/home-charging" />}>
                Browse residential chargers
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                  clear();
                }}
              >
                <Card>
                  <CardContent className="flex flex-col gap-4">
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      Delivery &amp; contact details
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First name">
                        <Input required placeholder="First name" />
                      </Field>
                      <Field label="Last name">
                        <Input required placeholder="Last name" />
                      </Field>
                      <Field label="Email">
                        <Input required type="email" placeholder="Email" />
                      </Field>
                      <Field label="Phone number">
                        <Input required type="tel" placeholder="Phone number" />
                      </Field>
                      <Field label="Delivery address" className="sm:col-span-2">
                        <Input required placeholder="Address" />
                      </Field>
                      <Field label="Postcode">
                        <Input required placeholder="Postcode" />
                      </Field>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No payment is taken online — this places your order for
                      review, and we&apos;ll be in touch to confirm payment
                      and schedule installation.
                    </p>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-fit bg-accent text-accent-foreground hover:bg-accent/90">
                  Place Order
                </Button>
              </form>

              <Card className="h-fit">
                <CardContent className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Order Summary
                  </h2>
                  <div className="flex flex-col gap-3">
                    {lines.map((line) => (
                      <div key={line.id} className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {line.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty {line.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {line.price != null
                            ? currency.format(line.price * line.quantity)
                            : "Quote"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {currency.format(subtotal)}
                    </p>
                  </div>
                  {hasQuoteOnlyItems && (
                    <p className="text-xs text-muted-foreground">
                      Accessories are priced per quote — we&apos;ll confirm
                      the full total when we&apos;re in touch.
                    </p>
                  )}
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

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}
