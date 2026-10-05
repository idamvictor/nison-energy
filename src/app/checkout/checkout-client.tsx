"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShoppingCart, Truck, Video, X } from "lucide-react";

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
import { CustomerStep } from "@/components/checkout/customer-step";
import {
  ExpressCheckout,
  PaymentSection,
  StripeCheckoutProvider,
  stripeConfigured,
  toStripeContact,
  type PayDetails,
} from "@/components/checkout/stripe-payment";
import { SurveyNextStep } from "@/components/checkout/survey-next-step";
import { useCart, resolveCartItem, formatCartOptions } from "@/lib/cart/store";
import { whatsappUrl } from "@/lib/whatsapp";
import { placeOrder, saveCheckoutDetails, startCheckout } from "@/lib/orders/actions";
import { includesInstallation } from "@/lib/orders/installation";
import { deliveryFeeFor, FREE_DELIVERY_THRESHOLD } from "@/lib/orders/delivery";
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

type Session = { clientSecret: string; draftId: string } & CheckoutTotals;

export function CheckoutClient({
  extras,
  defaults,
}: {
  extras: CheckoutExtra[];
  defaults?: CheckoutDefaults;
}) {
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
  // Pay / Place Order stay disabled until every required field (and the terms
  // box) passes the browser's own validation.
  const [formValid, setFormValid] = useState(false);
  const checkForm = () => setFormValid(formRef.current?.checkValidity() ?? false);
  // Also re-check after state-driven changes (address suggestions filling
  // town/postcode, the billing toggle) that don't fire an input event.
  useEffect(checkForm);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsNudge, setTermsNudge] = useState(false);
  // Town + postcode are controlled so picking an address suggestion can fill them.
  const [city, setCity] = useState("");
  // Prefer the account postcode; otherwise the one checked on the product page.
  const [postcode, setPostcode] = useState(
    () => defaults?.postcode || items.find((i) => i.options?.postcode)?.options?.postcode || "",
  );
  const [billingSame, setBillingSame] = useState(true);
  const [billingCity, setBillingCity] = useState("");
  const [billingPostcode, setBillingPostcode] = useState("");

  const lines = items
    .map((item) => resolveCartItem(item))
    .filter((line): line is NonNullable<typeof line> => line !== null);
  const selectedExtras = extras.filter((extra) => extraIds.includes(extra.id));
  const remainingExtras = extras.filter((extra) => !extraIds.includes(extra.id));
  const hasQuoteOnlyItems = lines.some((line) => line.price === null);
  const hasInstallation = includesInstallation(lines);

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

  // ── Stripe session: opened as soon as the page loads (express wallets need
  // it before any typing) and reopened whenever the cart or extras change.
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const draftRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!payable) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await startCheckout(JSON.parse(orderLinesJson), draftRef.current);
      if (result.ok) draftRef.current = result.draftId;
      if (cancelled) return;
      if (result.ok) {
        setSession(result);
        setSessionError(null);
      } else {
        setSession(null);
        setSessionError(result.error);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderLinesJson, payable]);

  // Server totals once the session is open; a same-rule estimate before that.
  const estimateSubtotal =
    Math.round(
      (lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0) +
        selectedExtras.reduce((sum, e) => sum + e.price, 0)) *
        100,
    ) / 100;
  const totals: CheckoutTotals = session ?? {
    subtotal: estimateSubtotal,
    deliveryFee: deliveryFeeFor(estimateSubtotal),
    total: estimateSubtotal + deliveryFeeFor(estimateSubtotal),
  };
  const toFreeDelivery = FREE_DELIVERY_THRESHOLD - totals.subtotal;

  function handleAddressSelect(suggestion: AddressSuggestion) {
    if (suggestion.city) setCity(suggestion.city);
    if (suggestion.postcode) setPostcode(suggestion.postcode.toUpperCase());
  }

  function handleBillingAddressSelect(suggestion: AddressSuggestion) {
    if (suggestion.city) setBillingCity(suggestion.city);
    if (suggestion.postcode) setBillingPostcode(suggestion.postcode.toUpperCase());
  }

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

  const stepNumbers = { customer: 1, survey: 2, extras: 3, address: extras.length > 0 ? 4 : 3 };
  const paymentStep = stepNumbers.address + 1;
  const showStripe = payable && stripeConfigured;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Checkout
          </h1>

          {submitted ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-6 py-16 text-center shadow-md">
              <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="size-6 text-success" />
              </span>
              <p className="font-heading text-lg font-semibold text-foreground">
                Thanks — we&apos;ve got your order
              </p>
              <p className="text-sm text-muted-foreground">Your order reference</p>
              <p className="font-heading text-2xl font-semibold text-primary-ink">{reference}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                A member of the team will be in touch to confirm payment and book your
                installation. If it&apos;s urgent,{" "}
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
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <form
                ref={formRef}
                onInput={checkForm}
                onChange={checkForm}
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only quote-only carts submit the form ("Place Order");
                  // payable carts pay through the Stripe section below.
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
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <Card className="border border-foreground/18 shadow-md">
                  <CardContent className="flex flex-col gap-4">
                    <StepHeading number={stepNumbers.customer} title="Customer" />
                    <CustomerStep signedInEmail={defaults?.email ?? null} />
                    {showStripe && session && (
                      <StripeCheckoutProvider key={`express-${session.clientSecret}`} clientSecret={session.clientSecret}>
                        <ExpressCheckout
                          termsAccepted={termsAccepted}
                          onNeedTerms={() => setTermsNudge(true)}
                        />
                      </StripeCheckoutProvider>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-foreground/18 shadow-md">
                  <CardContent className="flex flex-col gap-3">
                    <StepHeading number={stepNumbers.survey} title="Survey" />
                    <div className="flex items-start gap-3 rounded-lg bg-secondary px-4 py-3 ring-1 ring-foreground/10">
                      <Video className="mt-0.5 size-4.5 shrink-0 text-primary-ink" />
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">Virtual self survey</p>
                          <p className="text-sm font-semibold text-success">Free</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Instant — photos and a short questionnaire, reviewed by our team before
                          installation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {extras.length > 0 && (
                  <Card className="border border-foreground/18 shadow-md">
                    <CardContent className="flex flex-col gap-3">
                      <StepHeading number={stepNumbers.extras} title="Extras" />
                      {selectedExtras.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {selectedExtras.map((extra) => (
                            <div
                              key={extra.id}
                              className="flex items-center gap-3 rounded-lg border border-foreground/15 px-4 py-3"
                            >
                              <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-secondary ring-1 ring-border">
                                <Image src={extra.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                              </div>
                              <div className="flex flex-1 items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">{extra.name}</p>
                                <p className="text-sm font-semibold text-foreground">{formatCurrency(extra.price)}</p>
                              </div>
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
                        </div>
                      )}
                      {remainingExtras.length > 0 ? (
                        <Select
                          value={pendingExtra}
                          onValueChange={(value) => {
                            if (!value) return;
                            setExtraIds((ids) => [...ids, value]);
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
                        <p className="text-xs text-muted-foreground">All available extras have been added.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-foreground/18 shadow-md">
                  <CardContent className="flex flex-col gap-4">
                    <StepHeading number={stepNumbers.address} title="Your details & delivery address" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First name">
                        <Input name="firstName" defaultValue={defaults?.firstName} required autoComplete="given-name" placeholder="First name" />
                      </Field>
                      <Field label="Last name">
                        <Input name="lastName" defaultValue={defaults?.lastName} required autoComplete="family-name" placeholder="Last name" />
                      </Field>
                      <Field label="Email">
                        <Input name="email" defaultValue={defaults?.email} required type="email" autoComplete="email" placeholder="Email" />
                      </Field>
                      <Field label="Phone number">
                        <Input name="phone" defaultValue={defaults?.phone} required type="tel" autoComplete="tel" placeholder="Phone number" />
                      </Field>
                      <Field label={hasInstallation ? "Delivery & installation address" : "Delivery address"} className="sm:col-span-2">
                        <AddressAutocomplete
                          name="address"
                          defaultValue={defaults?.address}
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
                      <Field label={hasInstallation ? "Installation postcode" : "Postcode"}>
                        <PostcodeInput required value={postcode} onValueChange={setPostcode} />
                      </Field>
                    </div>

                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-secondary px-3.5 py-3 text-sm text-foreground ring-1 ring-foreground/10">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary-ink"
                      />
                      Use my delivery address as my billing address
                    </label>

                    {!billingSame && (
                      <div className="flex flex-col gap-4 rounded-lg border border-foreground/15 p-4">
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
                        : hasInstallation
                          ? "Your charger will arrive before your scheduled installation date."
                          : "Standard UK delivery in 1–3 working days."}
                    </p>
                  </CardContent>
                </Card>

                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg text-sm text-foreground ${
                    termsNudge && !termsAccepted ? "bg-destructive/5 p-3 ring-1 ring-destructive/40" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    required
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      setTermsNudge(false);
                    }}
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
                    {termsNudge && !termsAccepted && (
                      <span className="mt-1 block text-destructive">
                        Please tick to agree before paying with Apple Pay, Google Pay or PayPal.
                      </span>
                    )}
                  </span>
                </label>

                {error && <p className="text-sm text-destructive">{error}</p>}

                {hasQuoteOnlyItems ? (
                  // Quote-only items have no price, so they can't be paid
                  // online — the order goes to the team for review instead.
                  <Button type="submit" size="lg" variant="cta" disabled={pending || !formValid} className="w-fit">
                    {pending ? "Placing order…" : "Place Order"}
                  </Button>
                ) : (
                  <Card className="border border-foreground/18 shadow-md">
                    <CardContent className="flex flex-col gap-4">
                      <StepHeading number={paymentStep} title="Payment" />
                      {sessionError ? (
                        <p className="text-sm text-destructive">{sessionError}</p>
                      ) : !stripeConfigured ? (
                        <p className="text-sm text-destructive">
                          Online payment isn&apos;t configured yet — please use WhatsApp to complete your order.
                        </p>
                      ) : session ? (
                        <StripeCheckoutProvider key={`pay-${session.clientSecret}`} clientSecret={session.clientSecret}>
                          <PaymentSection canPay={formValid} prepare={preparePayment} />
                        </StripeCheckoutProvider>
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading secure payment…</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </form>

              {/* Pinned below the sticky site header on desktop while the form scrolls;
                  scrolls internally only if the summary itself outgrows the screen. */}
              <Card className="h-fit border border-foreground/18 shadow-md lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
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
                    {toFreeDelivery > 0 && (
                      <p className="rounded-md bg-secondary px-2.5 py-1.5 text-xs text-foreground/80">
                        Add {formatCurrency(toFreeDelivery)} more for <strong>free delivery</strong>.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <p className="font-medium text-foreground">Total (inc VAT)</p>
                    <p className="font-heading text-lg font-semibold text-foreground">{formatCurrency(totals.total)}</p>
                  </div>
                  {hasQuoteOnlyItems && (
                    <p className="text-xs text-muted-foreground">
                      Some items don&apos;t have a fixed price yet — we&apos;ll confirm the full total
                      when we&apos;re in touch.
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
      <h2 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h2>
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
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}
