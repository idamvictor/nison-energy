"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Cable,
  CheckCircle2,
  ShoppingCart,
  Smartphone,
  Umbrella,
  Video,
  X,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostcodeInput } from "@/components/shared/postcode-input";
import {
  AddressAutocomplete,
  type AddressSuggestion,
} from "@/components/shared/address-autocomplete";
import { useCart, resolveCartItem } from "@/hooks/use-cart";
import { generateReferenceCode } from "@/lib/reference-code";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

type ExtraId = "surge-protection" | "extra-cable" | "cable-cover" | "smart-setup";

type Extra = {
  id: ExtraId;
  name: string;
  price: number;
  description: string;
  icon: LucideIcon;
};

const availableExtras: Extra[] = [
  {
    id: "surge-protection",
    name: "Surge protection device",
    price: 40,
    description: "Recommended under wiring regulations.",
    icon: Zap,
  },
  {
    id: "extra-cable",
    name: "Additional Type 2 charging cable (5m)",
    price: 89,
    description: "A spare cable to keep in the car or at a second parking spot.",
    icon: Cable,
  },
  {
    id: "cable-cover",
    name: "Weatherproof cable management kit",
    price: 25,
    description: "Keeps the charging cable tidy and protected from the elements.",
    icon: Umbrella,
  },
  {
    id: "smart-setup",
    name: "Smart charging app setup & tariff optimisation",
    price: 35,
    description: "We configure your app and set up off-peak smart charging.",
    icon: Smartphone,
  },
];

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [extraIds, setExtraIds] = useState<ExtraId[]>([]);
  const [pendingExtra, setPendingExtra] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function handleAddressSelect(suggestion: AddressSuggestion) {
    if (!suggestion.postcode) return;
    const form = formRef.current;
    const field = form?.elements.namedItem("postcode");
    if (field instanceof HTMLInputElement) {
      field.value = suggestion.postcode;
      // PostcodeInput is controlled — dispatch a real input event so its
      // React state (and validation) picks up the programmatic change.
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  const lines = items
    .map((item) => resolveCartItem(item))
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const selectedExtras = availableExtras.filter((extra) =>
    extraIds.includes(extra.id)
  );
  const remainingExtras = availableExtras.filter(
    (extra) => !extraIds.includes(extra.id)
  );

  const itemsSubtotal = lines.reduce(
    (sum, line) => sum + (line.price ?? 0) * line.quantity,
    0
  );
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
  const subtotal = itemsSubtotal + extrasTotal;
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
              <p className="text-sm text-muted-foreground">Your order reference</p>
              <p className="font-heading text-2xl font-semibold text-primary">
                {reference}
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
                ref={formRef}
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setReference(generateReferenceCode("ORD"));
                  setSubmitted(true);
                  clear();
                }}
              >
                <Card>
                  <CardContent className="flex flex-col gap-3">
                    <StepHeading number={1} title="Survey" />
                    <div className="flex items-start gap-3 rounded-lg bg-secondary px-4 py-3">
                      <Video className="mt-0.5 size-4.5 shrink-0 text-primary" />
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            Virtual self survey
                          </p>
                          <p className="text-sm font-semibold text-success">Free</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Instant — photos and a short questionnaire, reviewed
                          by our team before installation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col gap-3">
                    <StepHeading number={2} title="Extras" />

                    {selectedExtras.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {selectedExtras.map((extra) => (
                          <div
                            key={extra.id}
                            className="flex items-start gap-3 rounded-lg border border-border px-4 py-3"
                          >
                            <extra.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {extra.name}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {currency.format(extra.price)}
                                </p>
                              </div>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {extra.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setExtraIds((ids) =>
                                  ids.filter((id) => id !== extra.id)
                                )
                              }
                              aria-label={`Remove ${extra.name}`}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {remainingExtras.length > 0 ? (
                      <Select
                        value={pendingExtra}
                        onValueChange={(value) => {
                          if (!value) return;
                          setExtraIds((ids) => [...ids, value as ExtraId]);
                          setPendingExtra("");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add an extra…" />
                        </SelectTrigger>
                        <SelectContent>
                          {remainingExtras.map((extra) => (
                            <SelectItem key={extra.id} value={extra.id}>
                              {extra.name} — {currency.format(extra.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        All available extras have been added.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col gap-4">
                    <StepHeading number={3} title="Installation address" />
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
                      <Field label="Installation address" className="sm:col-span-2">
                        <AddressAutocomplete
                          name="address"
                          required
                          onSelect={handleAddressSelect}
                        />
                      </Field>
                      <Field label="Postcode">
                        <PostcodeInput required />
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
                    {selectedExtras.map((extra) => (
                      <div key={extra.id} className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-border">
                          <extra.icon className="size-4.5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {extra.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty 1</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {currency.format(extra.price)}
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

function StepHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </span>
      <h2 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h2>
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
