"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingCart, Truck, Video, X } from "lucide-react";

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
import { AddressLookup } from "@/components/shared/address-lookup";
import { CustomerStep } from "@/components/checkout/customer-step";
import { CheckoutProgress, StepPanel } from "@/components/checkout/checkout-steps";
import {
  METHOD_MARKS,
  PAYMENT_METHOD_LABEL,
  PaymentMethods,
  type PaymentMethod,
} from "@/components/checkout/payment-methods";
import {
  ALL_WALLETS,
  AMAZON_ONLY,
  APPLE_GOOGLE,
  CardFields,
  CardPlaceOrder,
  ExpressCheckout,
  PAYPAL_ONLY,
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

type Session = { clientSecret: string; draftId: string; kind: "wallet" | "card" } & CheckoutTotals;

const WALLET_PRESET = { applegoogle: APPLE_GOOGLE, paypal: PAYPAL_ONLY, amazon: AMAZON_ONLY } as const;

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
  const deliveryRef = useRef<HTMLDivElement>(null);
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

  // ── Steps ── Customer → Delivery → Payment → Review (no Payment step for
  // quote-only carts, which can't be paid online).
  const steps = hasQuoteOnlyItems
    ? [
        { id: "customer", label: "Customer" },
        { id: "delivery", label: "Delivery" },
        { id: "review", label: "Review" },
      ]
    : [
        { id: "customer", label: "Customer" },
        { id: "delivery", label: "Delivery" },
        { id: "payment", label: "Payment" },
        { id: "review", label: "Review" },
      ];
  const stepIndex = (id: string) => steps.findIndex((s) => s.id === id);
  const [step, setStep] = useState(0);
  const [doneUpTo, setDoneUpTo] = useState(-1);
  const goTo = (index: number) => {
    setError(null);
    setStep(index);
  };
  const complete = (id: string) => {
    const index = stepIndex(id);
    setDoneUpTo((d) => Math.max(d, index));
    goTo(index + 1);
  };
  const currentId = steps[step]?.id;
  // Bring the newly opened step into view (collapsing the ones above can leave it off-screen).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const panel = formRef.current?.querySelector<HTMLElement>("[data-step-open]");
    if (panel && panel.getBoundingClientRect().top < 96) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);
  const [deliverySummary, setDeliverySummary] = useState("");

  // ── Payment method ──
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const sessionKind = method === "card" ? "card" : "wallet";
  const [cardCompleteFor, setCardCompleteFor] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsNudge, setTermsNudge] = useState(false);
  // Whether a one-tap button actually rendered (never on localhost / HTTP).
  const [shortcutShown, setShortcutShown] = useState<boolean | null>(null);
  const [walletShown, setWalletShown] = useState<boolean | null>(null);
  // Draft whose form details were saved for the chosen wallet (needed before
  // the wallet button is unlocked, so the order keeps the typed address).
  const [savedForDraft, setSavedForDraft] = useState<string | null>(null);

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

  // ── Stripe session: opened when the page loads (the shortcut wallets need it
  // before any typing), reopened when the cart/extras change or the method
  // switches between wallet and card.
  const [session, setSession] = useState<Session | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const draftRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!payable) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await startCheckout(JSON.parse(orderLinesJson), draftRef.current, sessionKind);
      if (result.ok) draftRef.current = result.draftId;
      if (cancelled) return;
      if (result.ok) {
        setSession({ ...result, kind: sessionKind });
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
  }, [orderLinesJson, payable, sessionKind]);

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
  const deliveryPrice = totals.deliveryFee === 0 ? "FREE" : formatCurrency(totals.deliveryFee);

  // The postcode lookup fills Town / City — unless the customer typed their own.
  const cityTyped = useRef(false);
  const billingCityTyped = useRef(false);

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

  /** Delivery step: validate just its fields, then move on with a summary. */
  function continueFromDelivery() {
    const fields = deliveryRef.current?.querySelectorAll<HTMLInputElement>("input, select, textarea") ?? [];
    for (const field of fields) {
      if (field.willValidate && !field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }
    const fd = new FormData(formRef.current ?? undefined);
    const name = `${fd.get("firstName") ?? ""} ${fd.get("lastName") ?? ""}`.trim();
    setDeliverySummary(`${name} · ${fd.get("address") ?? ""}, ${city} ${postcode} · ${fd.get("email") ?? ""}`);
    complete("delivery");
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

  // Wallet path at Review: once the terms are ticked, save the typed delivery
  // details on the draft, then unlock the wallet button.
  const walletMethod = method && method !== "card" ? method : null;
  useEffect(() => {
    if (currentId !== "review" || !walletMethod || !termsAccepted || !session || session.kind !== "wallet") return;
    if (savedForDraft === session.draftId) return;
    const form = formRef.current;
    if (!form) return;
    const draftId = session.draftId;
    void saveCheckoutDetails(draftId, buildPayload(new FormData(form))).then((saved) => {
      if (saved.ok) setSavedForDraft(draftId);
      else setError(Object.values(saved.errors)[0] ?? "Please check your details.");
    });
    // buildPayload reads the live form; re-running on its identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, walletMethod, termsAccepted, session, savedForDraft]);

  const cardComplete = session?.kind === "card" && cardCompleteFor === session.clientSecret;
  const methodReady = method === "card" ? cardComplete : method != null;
  const sessionMatches = session != null && session.kind === sessionKind;
  // The one-tap shortcut (own Stripe provider) only shows on the first visit to
  // Customer, before anything is chosen. Otherwise the Payment/Review provider
  // stays mounted, so the card fields (hidden while editing earlier steps)
  // always have their context and keep what was typed.
  const shortcutActive =
    currentId === "customer" && doneUpTo < 0 && payable && stripeConfigured && session?.kind === "wallet";

  const termsNotice = (
    <p className="text-xs text-muted-foreground">
      By paying you agree to our{" "}
      <Link href="/terms-of-sale" target="_blank" className="font-medium text-primary-ink underline underline-offset-2">
        Terms and Conditions of Sale
      </Link>
      .
    </p>
  );

  const paymentStatus = sessionError ? (
    <p className="text-sm text-destructive">{sessionError}</p>
  ) : !stripeConfigured ? (
    <p className="text-sm text-destructive">
      Online payment isn&apos;t configured yet — please use WhatsApp to complete your order.
    </p>
  ) : null;

  // Payment + Review panels share one Stripe session (card fields in Payment,
  // Place Order / wallet button in Review).
  const paymentPanel = !hasQuoteOnlyItems && (
    <StepPanel
      number={stepIndex("payment") + 1}
      title="Payment"
      open={currentId === "payment"}
      done={doneUpTo >= stepIndex("payment")}
      summary={method && <span className="flex flex-wrap items-center gap-2">{PAYMENT_METHOD_LABEL[method]} {METHOD_MARKS[method]}</span>}
      onEdit={() => goTo(stepIndex("payment"))}
    >
      <p className="text-sm text-muted-foreground">Choose your payment method</p>
      <PaymentMethods
        value={method}
        onChange={(next) => {
          setMethod(next);
          setWalletShown(null);
        }}
        cardSlot={
          paymentStatus ??
          (session?.kind === "card" ? (
            <CardFields
              onComplete={(done) => setCardCompleteFor(done ? session.clientSecret : null)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Loading secure card form…</p>
          ))
        }
      />
      <Button
        type="button"
        size="lg"
        variant="cta"
        disabled={!methodReady || !sessionMatches}
        onClick={() => complete("payment")}
        className="w-full gap-1.5 sm:w-fit"
      >
        Continue to review <ArrowRight className="size-4" />
      </Button>
    </StepPanel>
  );

  const reviewPanel = (
    <StepPanel
      number={stepIndex("review") + 1}
      title="Review & place order"
      open={currentId === "review"}
      done={false}
      onEdit={() => goTo(stepIndex("review"))}
    >
      <div className="flex flex-col divide-y divide-border rounded-lg ring-1 ring-foreground/10">
        <ReviewRow title="Delivery address" onEdit={() => goTo(stepIndex("delivery"))}>
          {deliverySummary}
        </ReviewRow>
        <ReviewRow title="Delivery method" onEdit={() => goTo(stepIndex("delivery"))}>
          {DELIVERY_LABEL} — {deliveryPrice}
        </ReviewRow>
        {!hasQuoteOnlyItems && method && (
          <ReviewRow title="Payment method" onEdit={() => goTo(stepIndex("payment"))}>
            <span className="flex flex-wrap items-center gap-2">
              {PAYMENT_METHOD_LABEL[method]} {METHOD_MARKS[method]}
            </span>
          </ReviewRow>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="font-medium text-foreground">Total (inc VAT)</span>
          <span className="font-heading text-lg font-semibold text-foreground">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <label
        className={`flex cursor-pointer items-start gap-2.5 rounded-lg text-sm text-foreground ${
          termsNudge && !termsAccepted ? "bg-destructive/5 p-3 ring-1 ring-destructive/40" : ""
        }`}
      >
        <input
          type="checkbox"
          name="acceptedTerms"
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
        </span>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {hasQuoteOnlyItems ? (
        // Quote-only items have no price, so they can't be paid online — the
        // order goes to the team for review instead.
        <Button type="submit" size="lg" variant="cta" disabled={pending || !termsAccepted} className="h-12 w-full text-base">
          {pending ? "Placing order…" : "Place Order"}
        </Button>
      ) : paymentStatus ? (
        paymentStatus
      ) : method === "card" ? (
        session?.kind === "card" ? (
          <CardPlaceOrder canPay={termsAccepted && cardComplete} prepare={preparePayment} />
        ) : (
          <p className="text-sm text-muted-foreground">Loading secure payment…</p>
        )
      ) : walletMethod && session?.kind === "wallet" ? (
        <div className="flex flex-col gap-2">
          <ExpressCheckout
            key={`${walletMethod}-${session.clientSecret}`}
            methods={WALLET_PRESET[walletMethod]}
            onAvailability={setWalletShown}
            locked={!termsAccepted || savedForDraft !== session.draftId}
            onLockedClick={() => setTermsNudge(true)}
          />
          {walletShown === false && (
            <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground/80 ring-1 ring-foreground/10">
              {PAYMENT_METHOD_LABEL[walletMethod]} isn&apos;t available here — it appears on the live site
              (secure HTTPS) when your device supports it.{" "}
              <button
                type="button"
                onClick={() => goTo(stepIndex("payment"))}
                className="font-medium text-primary-ink underline underline-offset-2"
              >
                Choose another payment method
              </button>
            </p>
          )}
          {termsAccepted && savedForDraft !== session.draftId && (
            <p className="text-xs text-muted-foreground">Preparing secure payment…</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Loading secure payment…</p>
      )}
    </StepPanel>
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
            <>
              <div className="mt-6">
                <CheckoutProgress steps={steps} current={step} doneUpTo={doneUpTo} onSelect={goTo} />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                <form
                  ref={formRef}
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Only quote-only carts submit the form ("Place Order");
                    // payable carts pay through Stripe at the Review step.
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

                  {/* 1 · Customer */}
                  <StepPanel
                    number={1}
                    title="Customer"
                    open={currentId === "customer"}
                    done={doneUpTo >= 0}
                    summary={defaults?.email ? `Signed in as ${defaults.email}` : "Guest checkout"}
                    onEdit={() => goTo(0)}
                  >
                    <p className="text-sm text-muted-foreground">How would you like to checkout?</p>
                    <CustomerStep signedInEmail={defaults?.email ?? null} />
                    <Button
                      type="button"
                      size="lg"
                      variant="cta"
                      onClick={() => complete("customer")}
                      className="w-full gap-1.5 sm:w-fit"
                    >
                      Continue <ArrowRight className="size-4" />
                    </Button>
                    {/* One-tap shortcut — the wallet supplies everything, skipping the other steps. */}
                    {shortcutActive && session && (
                      // Laid out but invisible until a button actually renders (the
                      // height check needs layout), then revealed; removed if none.
                      <div
                        className={
                          shortcutShown === false
                            ? "hidden"
                            : shortcutShown
                              ? "flex flex-col gap-3"
                              : "pointer-events-none flex h-0 flex-col gap-3 overflow-hidden opacity-0"
                        }
                      >
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="h-px flex-1 bg-border" />
                          Or continue with
                          <span className="h-px flex-1 bg-border" />
                        </div>
                        <StripeCheckoutProvider key={`shortcut-${session.clientSecret}`} clientSecret={session.clientSecret}>
                          <ExpressCheckout methods={ALL_WALLETS} onAvailability={setShortcutShown} />
                        </StripeCheckoutProvider>
                        {termsNotice}
                      </div>
                    )}
                  </StepPanel>

                  {/* 2 · Delivery */}
                  <StepPanel
                    number={2}
                    title="Delivery"
                    open={currentId === "delivery"}
                    done={doneUpTo >= 1}
                    summary={
                      <>
                        {deliverySummary}
                        <br />
                        {DELIVERY_LABEL} — {deliveryPrice}
                      </>
                    }
                    onEdit={() => goTo(1)}
                  >
                    <div ref={deliveryRef} className="flex flex-col gap-4">
                      <p className="text-sm font-semibold text-foreground">
                        {hasInstallation ? "Delivery & installation address" : "Delivery address"}
                      </p>
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
                        <Field label={hasInstallation ? "Installation postcode" : "Postcode"}>
                          <PostcodeInput required value={postcode} onValueChange={setPostcode} />
                        </Field>
                        <div className="hidden sm:block" />
                        <Field label="Address line 1" className="sm:col-span-2">
                          <AddressLookup
                            postcode={postcode}
                            name="address"
                            defaultValue={defaults?.address}
                            required
                            autoComplete="address-line1"
                            onTown={(town) => !cityTyped.current && setCity(town)}
                          />
                        </Field>
                        <Field label="Town / City">
                          <Input
                            name="city"
                            required
                            autoComplete="address-level2"
                            placeholder="Town or city"
                            value={city}
                            onChange={(e) => {
                              cityTyped.current = e.target.value.trim() !== "";
                              setCity(e.target.value);
                            }}
                          />
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
                            <Field label="Postcode">
                              <PostcodeInput
                                name="billingPostcode"
                                required
                                autoComplete="billing postal-code"
                                value={billingPostcode}
                                onValueChange={setBillingPostcode}
                              />
                            </Field>
                            <div className="hidden sm:block" />
                            <Field label="Address line 1" className="sm:col-span-2">
                              <AddressLookup
                                postcode={billingPostcode}
                                name="billingAddress"
                                required
                                autoComplete="billing address-line1"
                                onTown={(town) => !billingCityTyped.current && setBillingCity(town)}
                              />
                            </Field>
                            <Field label="Town / City">
                              <Input
                                name="billingCity"
                                required
                                autoComplete="billing address-level2"
                                placeholder="Town or city"
                                value={billingCity}
                                onChange={(e) => {
                                  billingCityTyped.current = e.target.value.trim() !== "";
                                  setBillingCity(e.target.value);
                                }}
                              />
                            </Field>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-foreground">Delivery method</p>
                        <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3">
                          <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-primary-ink">
                            <span className="size-1.5 rounded-full bg-primary-ink" />
                          </span>
                          <Truck className="size-4 text-primary-ink" />
                          <span className="flex-1 text-sm text-foreground">{DELIVERY_LABEL}</span>
                          <span className="text-sm font-semibold text-foreground">
                            {totals.deliveryFee === 0 ? <span className="text-success">FREE</span> : formatCurrency(totals.deliveryFee)}
                          </span>
                        </div>
                        {toFreeDelivery > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Free delivery on orders of {formatCurrency(FREE_DELIVERY_THRESHOLD)} or more — add{" "}
                            {formatCurrency(toFreeDelivery)} to qualify.
                          </p>
                        )}
                      </div>

                      <div className="flex items-start gap-3 rounded-lg bg-secondary px-4 py-3 ring-1 ring-foreground/10">
                        <Video className="mt-0.5 size-4.5 shrink-0 text-primary-ink" />
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">Virtual self survey</p>
                            <p className="text-sm font-semibold text-success">Free</p>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            Instant — photos and a short questionnaire, reviewed by our team before installation.
                          </p>
                        </div>
                      </div>

                      {extras.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-semibold text-foreground">Add extras</p>
                          {selectedExtras.map((extra) => (
                            <div key={extra.id} className="flex items-center gap-3 rounded-lg border border-foreground/15 px-4 py-3">
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
                        </div>
                      )}

                      {hasQuoteOnlyItems && (
                        <p className="text-xs text-muted-foreground">
                          No payment is taken online — this places your order for review, and we&apos;ll be in touch
                          to confirm payment and schedule installation.
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="lg"
                      variant="cta"
                      onClick={continueFromDelivery}
                      className="w-full gap-1.5 sm:w-fit"
                    >
                      {hasQuoteOnlyItems ? "Continue to review" : "Continue to payment"} <ArrowRight className="size-4" />
                    </Button>
                  </StepPanel>

                  {/* 3 · Payment and 4 · Review share one Stripe session. */}
                  {payable && stripeConfigured && sessionMatches && !shortcutActive ? (
                    <StripeCheckoutProvider key={`main-${session.clientSecret}`} clientSecret={session.clientSecret}>
                      {paymentPanel}
                      {reviewPanel}
                    </StripeCheckoutProvider>
                  ) : (
                    <>
                      {paymentPanel}
                      {reviewPanel}
                    </>
                  )}
                </form>

                {/* Pinned below the sticky site header on desktop while the steps scroll;
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
                        Some items don&apos;t have a fixed price yet — we&apos;ll confirm the full total when we&apos;re in
                        touch.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ReviewRow({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-0.5 text-muted-foreground">{children}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-sm font-medium text-primary-ink underline underline-offset-2 hover:text-foreground"
      >
        Edit
      </button>
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
