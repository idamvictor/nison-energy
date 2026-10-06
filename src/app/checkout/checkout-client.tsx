"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShoppingCart, Truck, Video, X } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostcodeInput } from "@/components/shared/postcode-input";
import { AddressLookup } from "@/components/shared/address-lookup";
import { CustomerStep } from "@/components/checkout/customer-step";
import { useCheckoutSession } from "@/components/checkout/use-checkout-session";
import { ExpressWallets, WalletSkeleton } from "@/components/checkout/express-wallets";
import { AmexLogo, MastercardLogo, VisaLogo } from "@/components/checkout/payment-logos";
import {
  CardFields,
  CardPlaceOrder,
  StripeCheckoutProvider,
  stripeConfigured,
  toStripeContact,
  type PayDetails,
} from "@/components/checkout/stripe-payment";
import { SurveyNextStep } from "@/components/checkout/survey-next-step";
import { useCart, resolveCartItem, formatCartOptions } from "@/lib/cart/store";
import { whatsappUrl } from "@/lib/whatsapp";
import { placeOrder, saveCheckoutDetails } from "@/lib/orders/actions";
import { includesInstallation } from "@/lib/orders/installation";
import { DELIVERY_LABEL, deliveryFeeFor, FREE_DELIVERY_THRESHOLD } from "@/lib/orders/delivery";
import type { CheckoutTotals, OrderLineInput, PlaceOrderPayload } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/currency";

/** A real catalogue accessory offered as a checkout add-on (see src/lib/orders/extras.ts). */
export type CheckoutExtra = {
  id: string;
  name: string;
  price: number;
  image: string;
};

/** Contact fields prefilled from the signed-in account (all still editable). */
export type CheckoutDefaults = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
};

export function CheckoutClient({ extras, defaults }: { extras: CheckoutExtra[]; defaults?: CheckoutDefaults }) {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  // Captured before the cart is cleared: installation orders get the survey next.
  const [needsSurvey, setNeedsSurvey] = useState(false);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [pendingExtra, setPendingExtra] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  // Town + postcode are controlled so the postcode lookup can fill the town.
  const [city, setCity] = useState("");
  // Prefer the account postcode; otherwise the one checked on the product page.
  const [postcode, setPostcode] = useState(
    () => defaults?.postcode || items.find((i) => i.options?.postcode)?.options?.postcode || "",
  );
  const [billingSame, setBillingSame] = useState(true);
  const [billingCity, setBillingCity] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");
  // The postcode lookup fills Town / City — unless the customer typed their own.
  const cityTyped = useRef(false);
  const billingCityTyped = useRef(false);

  const lines = items
    .map((item) => resolveCartItem(item))
    .filter((line): line is NonNullable<typeof line> => line !== null);
  const selectedExtras = extras.filter((extra) => extraIds.includes(extra.id));
  const remainingExtras = extras.filter((extra) => !extraIds.includes(extra.id));
  const hasQuoteOnlyItems = lines.some((line) => line.price === null);
  const hasInstallation = includesInstallation(lines);

  const [cardCompleteFor, setCardCompleteFor] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // What goes to the server. Prices here are display-only — the server
  // re-prices every line from the database (src/lib/orders/pricing.ts).
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
  const orderLinesJson = JSON.stringify(orderLines);
  const payable = lines.length > 0 && !hasQuoteOnlyItems && !submitted;

  // ── Two Stripe sessions: the Express Checkout buttons at the top use the
  // wallet session (Dashboard-driven methods; the wallet supplies the details),
  // the Payment section uses a card-only session with our form's details.
  const express = useCheckoutSession("wallet", orderLinesJson, payable);
  const card = useCheckoutSession("card", orderLinesJson, payable);
  const session = card.session;

  // Server totals once the session is open; a same-rule estimate before that.
  const estimateSubtotal =
    Math.round(
      (lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0) +
        selectedExtras.reduce((sum, e) => sum + e.price, 0)) *
        100,
    ) / 100;
  const totals: CheckoutTotals = card.session ??
    express.session ?? {
      subtotal: estimateSubtotal,
      deliveryFee: deliveryFeeFor(estimateSubtotal),
      total: estimateSubtotal + deliveryFeeFor(estimateSubtotal),
    };
  const toFreeDelivery = FREE_DELIVERY_THRESHOLD - totals.subtotal;

  function buildPayload(fd: FormData): PlaceOrderPayload {
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

  /** Card path: validate + save our form on the draft, then hand it to Stripe. */
  async function preparePayment(): Promise<PayDetails | null> {
    const form = formRef.current;
    if (!form || !session || !form.reportValidity()) return null;
    const payload = buildPayload(new FormData(form));
    setError(null);
    const saved = await saveCheckoutDetails(session.draftId, payload);
    if (!saved.ok) {
      setError(Object.values(saved.errors)[0] ?? "Please check your details.");
      return null;
    }
    const name = `${payload.firstName} ${payload.lastName}`.trim();
    const shipping = toStripeContact(name, payload.address, payload.city, payload.postcode);
    const billing = payload.billingSameAsDelivery
      ? shipping
      : toStripeContact(name, payload.billingAddress ?? "", payload.billingCity ?? "", payload.billingPostcode ?? "");
    return { email: payload.email, phone: payload.phone, shipping, billing };
  }

  const cardComplete = session != null && cardCompleteFor === session.clientSecret;
  const sessionError = card.error ?? express.error;
  const paymentStatus = sessionError ? (
    <p className="text-sm text-destructive">{sessionError}</p>
  ) : !stripeConfigured ? (
    <p className="text-sm text-destructive">
      Online payment isn&apos;t configured yet — please use WhatsApp to complete your order.
    </p>
  ) : null;

  const termsBox = (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
      <input
        type="checkbox"
        name="acceptedTerms"
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
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
  );

  // Card fields + Place Order share the card-only session.
  const paymentArea = (
    <Section
      title="Payment"
      aside={
        <span className="flex items-center gap-1.5" aria-label="Visa, Mastercard and American Express accepted">
          <VisaLogo className="h-8" />
          <MastercardLogo className="h-5" />
          <AmexLogo className="h-6" />
        </span>
      }
    >
      {paymentStatus ??
        (session ? (
          <CardFields onComplete={(done) => setCardCompleteFor(done ? session.clientSecret : null)} />
        ) : (
          <p className="text-sm text-muted-foreground">Loading secure card form…</p>
        ))}
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        {termsBox}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!paymentStatus &&
          (session ? (
            <CardPlaceOrder canPay={termsAccepted && cardComplete} prepare={preparePayment} />
          ) : (
            <Button type="button" size="lg" variant="cta" disabled className="h-12 w-full text-base">
              Loading secure payment…
            </Button>
          ))}
      </div>
    </Section>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">Checkout</h1>

          {submitted ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-6 py-16 text-center shadow-md">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="size-6 text-success" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">Thanks — we&apos;ve got your order</p>
              <p className="text-sm text-muted-foreground">Your order reference</p>
              <p className="font-heading text-2xl font-semibold text-primary-ink">{reference}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                A member of the team will be in touch to confirm payment and book your installation. If it&apos;s
                urgent,{" "}
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
          ) : null}

          {submitted && needsSurvey && <SurveyNextStep />}

          {submitted ? null : lines.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-foreground/20 bg-card py-20 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
                <ShoppingCart className="size-5" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">Your cart is empty</p>
              <Button nativeButton={false} render={<Link href="/home-charging" />}>
                Browse residential chargers
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <form
                ref={formRef}
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only quote-only carts submit the form ("Place Order");
                  // payable carts pay through Stripe below.
                  if (!hasQuoteOnlyItems) return;
                  const payload = buildPayload(new FormData(e.currentTarget));
                  setError(null);
                  startTransition(async () => {
                    const result = await placeOrder(payload);
                    if (!result.ok) {
                      setError(Object.values(result.errors)[0] ?? "Could not place the order.");
                      return;
                    }
                    setReference(result.reference);
                    setNeedsSurvey(includesInstallation(lines));
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
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {/* Express Checkout — the wallet supplies name, address and payment in one tap. */}
                {payable && stripeConfigured && (
                  <>
                    <fieldset className="flex flex-col gap-3 rounded-xl border border-foreground/15 bg-card px-5 pt-2 pb-5">
                      <legend className="mx-auto px-3 text-sm text-muted-foreground">Express Checkout</legend>
                      {express.session ? (
                        <StripeCheckoutProvider
                          key={`express-${express.session.clientSecret}`}
                          clientSecret={express.session.clientSecret}
                        >
                          <ExpressWallets />
                        </StripeCheckoutProvider>
                      ) : (
                        <WalletSkeleton />
                      )}
                      <p className="text-center text-xs text-muted-foreground">
                        By paying you agree to our{" "}
                        <Link
                          href="/terms-of-sale"
                          target="_blank"
                          className="font-medium text-primary-ink underline underline-offset-2"
                        >
                          Terms and Conditions of Sale
                        </Link>
                        .
                      </p>
                    </fieldset>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      Or continue below
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  </>
                )}

                <Section title={defaults?.email ? "Your account" : "Continue as guest or log in"}>
                  <CustomerStep signedInEmail={defaults?.email ?? null} />
                </Section>

                <Section title="Contact information">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name">
                      <Input name="firstName" defaultValue={defaults?.firstName} required autoComplete="given-name" />
                    </Field>
                    <Field label="Last name">
                      <Input name="lastName" defaultValue={defaults?.lastName} required autoComplete="family-name" />
                    </Field>
                    <Field label="Email" className="col-span-2 sm:col-span-1">
                      <Input name="email" defaultValue={defaults?.email} required type="email" autoComplete="email" />
                    </Field>
                    <Field label="Phone number" className="col-span-2 sm:col-span-1">
                      <Input name="phone" defaultValue={defaults?.phone} required type="tel" autoComplete="tel" />
                    </Field>
                  </div>
                </Section>

                <Section title={hasInstallation ? "Delivery & installation" : "Delivery"}>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={hasInstallation ? "Installation postcode" : "Postcode"}>
                      <PostcodeInput required value={postcode} onValueChange={setPostcode} />
                    </Field>
                    <Field label="Town / City">
                      <Input
                        name="city"
                        required
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => {
                          cityTyped.current = e.target.value.trim() !== "";
                          setCity(e.target.value);
                        }}
                      />
                    </Field>
                    <Field label="Address line 1" className="col-span-2">
                      <AddressLookup
                        postcode={postcode}
                        name="address"
                        defaultValue={defaults?.address}
                        required
                        autoComplete="address-line1"
                        onTown={(town) => !cityTyped.current && setCity(town)}
                      />
                    </Field>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={billingSame}
                      onChange={(e) => setBillingSame(e.target.checked)}
                      className="size-4 shrink-0 cursor-pointer accent-primary-ink"
                    />
                    Billing address is the same as delivery
                  </label>

                  {!billingSame && (
                    <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                      <p className="col-span-2 text-sm font-semibold text-foreground">Billing address</p>
                      <Field label="Postcode">
                        <PostcodeInput
                          name="billingPostcode"
                          required
                          autoComplete="billing postal-code"
                          value={billingPostcode}
                          onValueChange={setBillingPostcode}
                        />
                      </Field>
                      <Field label="Town / City">
                        <Input
                          name="billingCity"
                          required
                          autoComplete="billing address-level2"
                          value={billingCity}
                          onChange={(e) => {
                            billingCityTyped.current = e.target.value.trim() !== "";
                            setBillingCity(e.target.value);
                          }}
                        />
                      </Field>
                      <Field label="Address line 1" className="col-span-2">
                        <AddressLookup
                          postcode={billingPostcode}
                          name="billingAddress"
                          required
                          autoComplete="billing address-line1"
                          onTown={(town) => !billingCityTyped.current && setBillingCity(town)}
                        />
                      </Field>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2.5 rounded-lg border border-primary-ink/60 bg-primary/5 px-3 py-2.5">
                      <Truck className="size-4 shrink-0 text-primary-ink" />
                      <span className="flex-1 text-sm leading-tight text-foreground">{DELIVERY_LABEL}</span>
                      <span className="text-sm font-semibold">
                        {totals.deliveryFee === 0 ? (
                          <span className="text-success">FREE</span>
                        ) : (
                          formatCurrency(totals.deliveryFee)
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg border border-foreground/12 px-3 py-2.5">
                      <Video className="size-4 shrink-0 text-primary-ink" />
                      <span className="flex-1 text-sm leading-tight text-foreground">
                        Virtual self survey
                        <span className="block text-xs text-muted-foreground">Photos + short questionnaire</span>
                      </span>
                      <span className="text-sm font-semibold text-success">Free</span>
                    </div>
                  </div>
                  {toFreeDelivery > 0 && (
                    <p className="-mt-1 text-xs text-muted-foreground">
                      Free delivery on orders of {formatCurrency(FREE_DELIVERY_THRESHOLD)} or more — add{" "}
                      {formatCurrency(toFreeDelivery)} to qualify.
                    </p>
                  )}

                  {extras.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {selectedExtras.map((extra) => (
                        <div
                          key={extra.id}
                          className="flex items-center gap-3 rounded-lg border border-foreground/12 px-3 py-2"
                        >
                          <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-secondary ring-1 ring-border">
                            <Image src={extra.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
                          </div>
                          <p className="flex-1 text-sm text-foreground">{extra.name}</p>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(extra.price)}</p>
                          <button
                            type="button"
                            onClick={() => setExtraIds((ids) => ids.filter((id) => id !== extra.id))}
                            aria-label={`Remove ${extra.name}`}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                      {remainingExtras.length > 0 && (
                        <Select
                          value={pendingExtra}
                          onValueChange={(value) => {
                            if (!value) return;
                            setExtraIds((ids) => [...ids, value]);
                            setPendingExtra("");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Add an extra (optional)…" />
                          </SelectTrigger>
                          <SelectContent>
                            {remainingExtras.map((extra) => (
                              <SelectItem key={extra.id} value={extra.id}>
                                {extra.name} — {formatCurrency(extra.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </Section>

                {hasQuoteOnlyItems ? (
                  // Quote-only items have no price, so they can't be paid online —
                  // the order goes to the team for review instead.
                  <Section>
                    <p className="text-xs text-muted-foreground">
                      No payment is taken online — this places your order for review, and we&apos;ll be in touch to
                      confirm payment and schedule installation.
                    </p>
                    {termsBox}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button
                      type="submit"
                      size="lg"
                      variant="cta"
                      disabled={pending || !termsAccepted}
                      className="h-12 w-full text-base"
                    >
                      {pending ? "Placing order…" : "Place Order"}
                    </Button>
                  </Section>
                ) : payable && stripeConfigured && session ? (
                  <StripeCheckoutProvider key={`card-${session.clientSecret}`} clientSecret={session.clientSecret}>
                    {paymentArea}
                  </StripeCheckoutProvider>
                ) : (
                  paymentArea
                )}
              </form>

              {/* Pinned below the sticky site header on desktop while the form scrolls;
                  scrolls internally only if the summary itself outgrows the screen. */}
              <Card className="h-fit border border-foreground/12 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <CardContent className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-semibold text-foreground">Order Summary</h2>
                  <div className="flex flex-col gap-3">
                    {lines.map((line) => (
                      <div key={line.id} className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
                          <Image src={line.image} alt={line.name} fill sizes="48px" className="object-contain p-1" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{line.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty {line.quantity}
                            {formatCartOptions(line.options) && ` · ${formatCartOptions(line.options)}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {line.price != null ? formatCurrency(line.price * line.quantity) : "Quote"}
                        </p>
                      </div>
                    ))}
                    {selectedExtras.map((extra) => (
                      <div key={extra.id} className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
                          <Image src={extra.image} alt={extra.name} fill sizes="48px" className="object-contain p-1" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{extra.name}</p>
                          <p className="text-xs text-muted-foreground">Qty 1</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(extra.price)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Truck className="size-3.5" /> Delivery
                      </p>
                      <p className="font-medium text-foreground">
                        {totals.deliveryFee === 0 ? (
                          <span className="font-semibold text-success">FREE</span>
                        ) : (
                          formatCurrency(totals.deliveryFee)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <p className="font-medium text-foreground">Total (inc VAT)</p>
                    <p className="font-heading text-lg font-semibold text-foreground">{formatCurrency(totals.total)}</p>
                  </div>
                  {hasQuoteOnlyItems && (
                    <p className="text-xs text-muted-foreground">
                      Some items don&apos;t have a fixed price yet — we&apos;ll confirm the full total when we&apos;re
                      in touch.
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

/** One plain white card per section; optional heading with a right-hand aside. */
function Section({ title, aside, children }: { title?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-foreground/12 bg-card p-5 shadow-sm">
      {title && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}
