"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
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
import { useCart, resolveCartItem, formatCartOptions } from "@/lib/cart/store";
import { whatsappUrl } from "@/lib/whatsapp";
import { placeOrder, createCheckoutSession } from "@/lib/orders/actions";
import type { OrderLineInput, PlaceOrderPayload } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/currency";

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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [payPending, startPayTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  // Town + postcode are controlled so picking an address suggestion can fill them.
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [billingCity, setBillingCity] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");

  function handleAddressSelect(suggestion: AddressSuggestion) {
    if (suggestion.city) setCity(suggestion.city);
    if (suggestion.postcode) setPostcode(suggestion.postcode.toUpperCase());
  }

  function handleBillingAddressSelect(suggestion: AddressSuggestion) {
    if (suggestion.city) setBillingCity(suggestion.city);
    if (suggestion.postcode) setBillingPostcode(suggestion.postcode.toUpperCase());
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
  const subtotal = Math.round((itemsSubtotal + extrasTotal) * 100) / 100;
  const hasQuoteOnlyItems = lines.some((line) => line.price === null);

  function buildPayload(fd: FormData): PlaceOrderPayload {
    const orderLines: OrderLineInput[] = [
      ...lines.map((line) => ({
        productId: line.id,
        category: line.category,
        name: line.name,
        unitPrice: line.price,
        quantity: line.quantity,
        options: line.options,
      })),
      ...selectedExtras.map((extra) => ({
        productId: extra.id,
        category: "extra" as const,
        name: extra.name,
        unitPrice: extra.price,
        quantity: 1,
      })),
    ];

    return {
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      city,
      postcode,
      billingSameAsDelivery: billingSame,
      billingAddress: billingSame ? undefined : String(fd.get("billingAddress") ?? ""),
      billingCity: billingSame ? undefined : billingCity,
      billingPostcode: billingSame ? undefined : billingPostcode,
      acceptedTerms: fd.get("acceptedTerms") === "on",
      honeypot: String(fd.get("company_website") ?? ""),
      lines: orderLines,
    };
  }

  function handleProceedToPayment() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const payload = buildPayload(new FormData(form));
    setError(null);
    startPayTransition(async () => {
      const result = await createCheckoutSession(payload);
      if (!result.ok) {
        setError(Object.values(result.errors)[0] ?? "Could not start checkout.");
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Checkout
          </h1>

          {!submitted && (
            <Link
              href="/ozev-grant-guide"
              className="group mt-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
                  <Zap className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Did you know you could get up to £500 off with an OZEV grant?
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Check Your OZEV Grant Eligibility — £0 Today!
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-primary-ink transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          {submitted ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="size-6 text-success" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">
                Thanks — we&apos;ve got your order
              </p>
              <p className="text-sm text-muted-foreground">Your order reference</p>
              <p className="font-heading text-2xl font-semibold text-primary-ink">
                {reference}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                A member of the team will be in touch to confirm payment and
                book your installation. If it&apos;s urgent,{" "}
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-ink underline underline-offset-2"
                >
                  message us on WhatsApp
                </a>
                .
              </p>
              <Button nativeButton={false} render={<Link href="/" />}>
                Back to home
              </Button>
            </div>
          ) : lines.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
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
                  if (!hasQuoteOnlyItems) {
                    handleProceedToPayment();
                    return;
                  }
                  const payload = buildPayload(new FormData(e.currentTarget));
                  setError(null);

                  startTransition(async () => {
                    const result = await placeOrder(payload);
                    if (!result.ok) {
                      setError(
                        Object.values(result.errors)[0] ??
                          "Could not place the order.",
                      );
                      return;
                    }
                    setReference(result.reference);
                    setSubmitted(true);
                    clear();
                  });
                }}
              >
                {/* Honeypot — hidden from users, tempting to bots. */}
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <Card>
                  <CardContent className="flex flex-col gap-3">
                    <StepHeading number={1} title="Survey" />
                    <div className="flex items-start gap-3 rounded-lg bg-secondary px-4 py-3">
                      <Video className="mt-0.5 size-4.5 shrink-0 text-primary-ink" />
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
                            <extra.icon className="mt-0.5 size-4 shrink-0 text-primary-ink" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {extra.name}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatCurrency(extra.price)}
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
                              {extra.name} — {formatCurrency(extra.price)}
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
                    <StepHeading number={3} title="Delivery and Installation Address" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First name">
                        <Input name="firstName" required autoComplete="given-name" placeholder="First name" />
                      </Field>
                      <Field label="Last name">
                        <Input name="lastName" required autoComplete="family-name" placeholder="Last name" />
                      </Field>
                      <Field label="Email">
                        <Input name="email" required type="email" autoComplete="email" placeholder="Email" />
                      </Field>
                      <Field label="Phone number">
                        <Input name="phone" required type="tel" autoComplete="tel" placeholder="Phone number" />
                      </Field>
                      <Field label="Address line 1" className="sm:col-span-2">
                        <AddressAutocomplete
                          name="address"
                          required
                          autoComplete="address-line1"
                          placeholder="Start typing your house number and street"
                          onSelect={handleAddressSelect}
                        />
                      </Field>
                      <Field label="Town / City">
                        <Input
                          name="city"
                          required
                          autoComplete="address-level2"
                          placeholder="Town or city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </Field>
                      <Field label="Postcode">
                        <PostcodeInput required value={postcode} onValueChange={setPostcode} />
                      </Field>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-secondary px-3.5 py-3 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary-ink"
                      />
                      My billing address is the same as my delivery and
                      installation address
                    </label>

                    {!billingSame && (
                      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                        <p className="text-sm font-semibold text-foreground">Billing address</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Address line 1" className="sm:col-span-2">
                            <AddressAutocomplete
                              name="billingAddress"
                              required
                              autoComplete="billing address-line1"
                              placeholder="Start typing your billing address"
                              onSelect={handleBillingAddressSelect}
                            />
                          </Field>
                          <Field label="Town / City">
                            <Input
                              name="billingCity"
                              required
                              autoComplete="billing address-level2"
                              placeholder="Town or city"
                              value={billingCity}
                              onChange={(e) => setBillingCity(e.target.value)}
                            />
                          </Field>
                          <Field label="Postcode">
                            <PostcodeInput
                              name="billingPostcode"
                              required
                              autoComplete="billing postal-code"
                              value={billingPostcode}
                              onValueChange={setBillingPostcode}
                            />
                          </Field>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {hasQuoteOnlyItems
                        ? "No payment is taken online — this places your order for review, and we’ll be in touch to confirm payment and schedule installation."
                        : "Your charger will arrive before your scheduled installation date."}
                    </p>
                  </CardContent>
                </Card>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    required
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary-ink"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <Link
                      href="/terms-of-sale"
                      target="_blank"
                      className="font-medium text-primary-ink underline underline-offset-2 hover:text-foreground"
                    >
                      Terms and Conditions of Sale
                    </Link>
                    .
                  </span>
                </label>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex flex-wrap gap-3">
                  {hasQuoteOnlyItems ? (
                    // Quote-only items have no price, so they can't be paid
                    // online — the order goes to the team for review instead.
                    <Button type="submit" size="lg" variant="cta" disabled={pending} className="w-fit">
                      {pending ? "Placing order…" : "Place Order"}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="lg"
                      variant="cta"
                      disabled={payPending}
                      className="w-fit gap-1.5"
                    >
                      {payPending ? "Opening secure payment…" : "Proceed to Payment"}
                      {!payPending && <ArrowRight className="size-4" />}
                    </Button>
                  )}
                </div>
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
                            {formatCartOptions(line.options) &&
                              ` · ${formatCartOptions(line.options)}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {line.price != null
                            ? formatCurrency(line.price * line.quantity)
                            : "Quote"}
                        </p>
                      </div>
                    ))}
                    {selectedExtras.map((extra) => (
                      <div key={extra.id} className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-border">
                          <extra.icon className="size-4.5 text-primary-ink" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {extra.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty 1</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(extra.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-heading text-lg font-semibold text-foreground">
                      {formatCurrency(subtotal)}
                    </p>
                  </div>
                  {hasQuoteOnlyItems && (
                    <p className="text-xs text-muted-foreground">
                      Some items don&apos;t have a fixed price yet —
                      we&apos;ll confirm the full total when we&apos;re in touch.
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
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
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
