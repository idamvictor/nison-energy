"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronDown, CircleHelp, ShoppingBag, Truck, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostcodeInput } from "@/components/shared/postcode-input";
import { AddressLookup } from "@/components/shared/address-lookup";
import { AccountRow, GuestOrSignIn } from "@/components/checkout/customer-step";
import { FIELD_INPUT, FloatField } from "@/components/checkout/float-field";
import { ExtrasPicker } from "@/components/checkout/extras-picker";
import { useCheckoutSession } from "@/components/checkout/use-checkout-session";
import { useInView } from "@/components/checkout/use-in-view";
import { useInstallFees } from "@/components/checkout/use-install-fees";
import { ExpressWallets, WalletSkeleton } from "@/components/checkout/express-wallets";
import { AmexLogo, KlarnaLogo, MastercardLogo, PayPalLogo, VisaLogo } from "@/components/checkout/payment-logos";
import {
  PaymentFields,
  CardPlaceOrder,
  StripeCheckoutProvider,
  stripeConfigured,
  toStripeContact,
  type PayDetails,
} from "@/components/checkout/stripe-payment";
import { SurveyNextStep } from "@/components/checkout/survey-next-step";
import { useCart, resolveCartItem, formatCartOptions } from "@/lib/cart/store";
import { useCheckoutForm } from "@/lib/checkout/form-store";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { placeOrder, saveCheckoutDetails } from "@/lib/orders/actions";
import { includesInstallation, installSplit } from "@/lib/orders/installation";
import {
  DELIVERY_ESTIMATE,
  DELIVERY_LABEL,
  deliveryFeeFor,
  FREE_DELIVERY_FROM,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/orders/delivery";
import type { CheckoutTotals, OrderLineInput, PlaceOrderPayload } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/currency";
import { checkCheckoutDetails } from "@/lib/orders/schema";

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

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

type PayMethod = "card" | "paypal" | "klarna";

const METHOD_ACTION: Record<PayMethod, { label: string; busy: string }> = {
  card: { label: "Place Order", busy: "Processing payment…" },
  paypal: { label: "Continue to PayPal", busy: "Redirecting to PayPal…" },
  klarna: { label: "Continue with Klarna", busy: "Redirecting to Klarna…" },
};

export function CheckoutClient({ extras, defaults }: { extras: CheckoutExtra[]; defaults?: CheckoutDefaults }) {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  // Captured before the cart is cleared: installation orders get the survey next.
  const [needsSurvey, setNeedsSurvey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [summaryOpen, setSummaryOpen] = useState(false);
  // Guests pick "Continue as guest" to reveal the email field.
  const [guestChosen, setGuestChosen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  // Everything typed is saved in this browser as it's typed
  // (src/lib/checkout/form-store.ts), so a reload or a trip back to the cart
  // keeps it. Account details fill anything not typed yet.
  const form = useCheckoutForm();
  const setForm = useCheckoutForm((s) => s.set);
  const clearForm = useCheckoutForm((s) => s.clear);
  const extraIds = form.extraIds ?? [];
  const firstName = form.firstName ?? defaults?.firstName ?? "";
  const lastName = form.lastName ?? defaults?.lastName ?? "";
  const email = form.email ?? defaults?.email ?? "";
  const phone = form.phone ?? defaults?.phone ?? "";
  const company = form.company ?? "";
  const address = form.address ?? defaults?.address ?? "";
  const addressLine2 = form.addressLine2 ?? "";
  const city = form.city ?? "";
  // Prefer a typed postcode, then the account's, then one from the product page.
  const postcode =
    form.postcode ?? (defaults?.postcode || items.find((i) => i.options?.postcode)?.options?.postcode || "");
  // Unticked until the customer chooses to reuse the delivery address.
  const billingSame = form.billingSame ?? false;
  const billingCity = form.billingCity ?? "";
  const billingPostcode = form.billingPostcode ?? "";
  const billingAddress = form.billingAddress ?? "";
  const billingAddressLine2 = form.billingAddressLine2 ?? "";
  const postcodeValid = UK_POSTCODE_RE.test(postcode.trim());
  const showEmail = !defaults?.email && (guestChosen || form.email !== undefined);

  const lines = items
    .map((item) => resolveCartItem(item))
    .filter((line): line is NonNullable<typeof line> => line !== null);
  // Extras already in the basket aren't offered (or kept) again as a second line.
  const inBasket = new Set(lines.map((line) => line.id));
  const selectedExtras = extras.filter((extra) => extraIds.includes(extra.id) && !inBasket.has(extra.id));
  const remainingExtras = extras.filter((extra) => !extraIds.includes(extra.id) && !inBasket.has(extra.id));
  const hasQuoteOnlyItems = lines.some((line) => line.price === null);
  const hasInstallation = includesInstallation(lines);
  // DB installation fees, so charger and installation always show separately.
  const installFees = useInstallFees(lines.filter((l) => l.options?.installation === "standard").map((l) => l.id));

  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [cardCompleteFor, setCardCompleteFor] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ── Validation: the same Zod rules as the server (src/lib/orders/schema.ts).
  // A field shows its error once it's been left (blurred) or after a Place
  // Order attempt, and the error clears as soon as the value is fixed.
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [attempted, setAttempted] = useState(false);
  const check = checkCheckoutDetails({
    firstName,
    lastName,
    email,
    phone,
    company,
    address,
    addressLine2,
    city,
    postcode,
    billingSameAsDelivery: billingSame,
    billingAddress,
    billingAddressLine2,
    billingCity,
    billingPostcode,
    acceptedTerms: termsAccepted,
  });
  const errors: Record<string, string> = check.ok ? {} : check.errors;
  const err = (field: string) => ((attempted || touched.has(field)) && errors[field]) || null;
  const markTouched = (field: string) => setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));

  /** Show every error and jump to the first one. Returns true when the form is valid. */
  function validateAll(): boolean {
    setAttempted(true);
    if (check.ok) return true;
    const order = [
      "email",
      "firstName",
      "lastName",
      "company",
      "postcode",
      "city",
      "address",
      "addressLine2",
      "phone",
      "billingPostcode",
      "billingCity",
      "billingAddress",
      "billingAddressLine2",
      "acceptedTerms",
    ];
    const first = order.find((field) => errors[field]);
    // After the next paint, so a just-revealed field (guest email) can take focus.
    window.setTimeout(() => {
      const el = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    }, 50);
    return false;
  }

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

  // ── Stripe sessions (reused from this browser while the basket is unchanged):
  // the Express Checkout row at the top, plus one per payment option — card
  // (opened once Payment is near), PayPal and Klarna (opened when chosen; both
  // redirect to approve). All three are paid through our form.
  const [paymentRef, paymentInView] = useInView<HTMLDivElement>();
  const express = useCheckoutSession("wallet", orderLinesJson, payable);
  const card = useCheckoutSession("card", orderLinesJson, payable && paymentInView);
  const paypal = useCheckoutSession("paypal", orderLinesJson, payable && payMethod === "paypal");
  const klarna = useCheckoutSession("klarna", orderLinesJson, payable && payMethod === "klarna");
  const active = { card, paypal, klarna }[payMethod];
  const session = active.session;

  // Server totals once a session is open; a same-rule estimate before that.
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
  // Prices include VAT at 20%.
  const vat = Math.round((totals.total / 6) * 100) / 100;

  function buildPayload(fd: FormData): PlaceOrderPayload {
    return {
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      company: String(fd.get("company") ?? ""),
      address: String(fd.get("address") ?? ""),
      addressLine2: String(fd.get("addressLine2") ?? ""),
      city,
      postcode,
      billingSameAsDelivery: billingSame,
      billingAddress: billingSame ? undefined : String(fd.get("billingAddress") ?? ""),
      billingAddressLine2: billingSame ? undefined : String(fd.get("billingAddressLine2") ?? ""),
      billingCity: billingSame ? undefined : billingCity,
      billingPostcode: billingSame ? undefined : billingPostcode,
      acceptedTerms: fd.get("acceptedTerms") === "on",
      honeypot: String(fd.get("company_website") ?? ""),
      lines: orderLines,
    };
  }

  /** Card path: validate + save our form on the draft, then hand it to Stripe. */
  async function preparePayment(): Promise<PayDetails | null> {
    const formEl = formRef.current;
    // Not chosen yet: open the guest email field so its error can show too.
    if (!defaults?.email && !showEmail) setGuestChosen(true);
    if (!formEl || !session || !validateAll()) return null;
    if (payMethod === "card" && !methodComplete) {
      setError("Enter your card number, expiry date and security code.");
      return null;
    }
    const payload = buildPayload(new FormData(formEl));
    setError(null);
    const saved = await saveCheckoutDetails(session.draftId, payload);
    if (!saved.ok) {
      setError(Object.values(saved.errors)[0] ?? "Please check your details.");
      return null;
    }
    const name = `${payload.firstName} ${payload.lastName}`.trim();
    const shipping = toStripeContact(name, payload.address, payload.city, payload.postcode, payload.addressLine2);
    const billing = payload.billingSameAsDelivery
      ? shipping
      : toStripeContact(
          name,
          payload.billingAddress ?? "",
          payload.billingCity ?? "",
          payload.billingPostcode ?? "",
          payload.billingAddressLine2,
        );
    return { email: payload.email, phone: payload.phone, shipping, billing };
  }

  const methodComplete = session != null && cardCompleteFor === session.clientSecret;
  const sessionError = active.error ?? express.error;
  // The pay button only becomes active once everything required is in place.
  const readyToPay = check.ok && (payMethod !== "card" || methodComplete);
  const missingFields = Object.keys(errors).filter((f) => f !== "acceptedTerms");
  const payHint =
    !defaults?.email && !showEmail
      ? "Choose “Continue as guest” or sign in to continue."
      : missingFields.length > 0
        ? "Fill in all required fields to continue."
        : errors.acceptedTerms
          ? "Tick the Terms and Conditions to continue."
          : "Enter your card details to continue.";
  const paymentStatus = sessionError ? (
    <p className="text-sm text-red-300">{sessionError}</p>
  ) : !stripeConfigured ? (
    <p className="text-sm text-red-300">
      Online payment isn&apos;t configured yet — please use WhatsApp to complete your order.
    </p>
  ) : null;

  const termsBox = (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-white">
      <input
        type="checkbox"
        name="acceptedTerms"
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded accent-white"
      />
      <span>
        I have read and agree to the{" "}
        <Link href="/terms-of-sale" target="_blank" className="underline underline-offset-2 hover:text-white/80">
          Terms and Conditions of Sale
        </Link>
        .
      </span>
    </label>
  );
  const termsError = err("acceptedTerms");

  // ── Billing address (under the payment list — used by every method) ──
  const billingFields = !billingSame && (
    <div className="grid grid-cols-2 gap-2.5 pt-1">
      <FloatField as="div" label="Postcode" filled={billingPostcode !== ""} error={err("billingPostcode")} tone="light">
        <PostcodeInput
          name="billingPostcode"
          required
          autoComplete="billing postal-code"
          placeholder=""
          className={FIELD_INPUT}
          value={billingPostcode}
          onValueChange={(value) => setForm({ billingPostcode: value })}
        />
      </FloatField>
      <FloatField label="City" filled={billingCity !== ""} error={err("billingCity")} tone="light">
        <Input
          name="billingCity"
          required
          autoComplete="billing address-level2"
          className={FIELD_INPUT}
          value={billingCity}
          onChange={(e) => setForm({ billingCity: e.target.value, billingCityTyped: e.target.value.trim() !== "" })}
        />
      </FloatField>
      <FloatField
        as="div"
        label="Billing address"
        filled={billingAddress !== ""}
        className="col-span-2"
        error={err("billingAddress")}
        tone="light"
      >
        <AddressLookup
          postcode={billingPostcode}
          name="billingAddress"
          required
          autoComplete="billing address-line1"
          placeholder=""
          inputClassName={FIELD_INPUT}
          value={billingAddress}
          onValueChange={(value) => setForm({ billingAddress: value })}
          onTown={(town) => !useCheckoutForm.getState().billingCityTyped && setForm({ billingCity: town })}
        />
      </FloatField>
      <FloatField
        label="Apartment, suite, etc. (optional)"
        filled={billingAddressLine2 !== ""}
        className="col-span-2"
        error={err("billingAddressLine2")}
        tone="light"
      >
        <Input
          name="billingAddressLine2"
          autoComplete="billing address-line2"
          className={FIELD_INPUT}
          value={billingAddressLine2}
          onChange={(e) => setForm({ billingAddressLine2: e.target.value })}
        />
      </FloatField>
    </div>
  );

  // ── Payment: Credit card, PayPal or Klarna, as a radio list ──
  const methodRow = (method: PayMethod, title: string, logo: React.ReactNode, first = false) => (
    <button
      type="button"
      role="radio"
      aria-checked={payMethod === method}
      onClick={() => setPayMethod(method)}
      className={cn(
        "flex w-full items-center gap-2.5 p-3.5 text-left",
        !first && "border-t border-[#dedede]",
        payMethod === method ? "bg-[#f6f6f6]" : "bg-white",
      )}
    >
      <Radio checked={payMethod === method} />
      <span className="flex-1 text-sm font-medium">{title}</span>
      {logo}
    </button>
  );

  const paymentSection = (
    <div ref={paymentRef} className="flex flex-col gap-3.5">
      <div>
        <h2 className="text-[20px] leading-6 font-medium text-white">Payment</h2>
        <p className="mt-1 text-sm text-white/65">All transactions are secure and encrypted.</p>
      </div>
      {paymentStatus ?? (
        <div className="overflow-hidden rounded-[12px] border border-[#dedede] bg-white text-black">
          {methodRow(
            "card",
            "Credit card",
            <span className="flex items-center gap-1">
              <VisaLogo className="h-7" />
              <MastercardLogo className="h-[18px]" />
              <AmexLogo className="h-6" />
            </span>,
            true,
          )}
          {payMethod === "card" &&
            (session ? (
              <div className="flex flex-col gap-3 border-t border-[#dedede] bg-black/[0.04] p-3.5">
                <PaymentFields onComplete={(done) => setCardCompleteFor(done ? session.clientSecret : null)} />
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t border-[#dedede] bg-black/[0.04] p-3.5">
                <div className="flex flex-col gap-2.5" aria-hidden>
                  <span className="h-[46px] animate-pulse rounded-[12px] bg-[#eee]" />
                  <span className="grid grid-cols-2 gap-2.5">
                    <span className="h-[46px] animate-pulse rounded-[12px] bg-[#eee]" />
                    <span className="h-[46px] animate-pulse rounded-[12px] bg-[#eee]" />
                  </span>
                </div>
              </div>
            ))}
          {methodRow("paypal", "PayPal", <PayPalLogo className="scale-90" />)}
          {payMethod === "paypal" && (
            <div className="relative border-t border-[#dedede] bg-black/[0.04] px-3.5 py-4">
              <p className="text-center text-sm text-black">
                You&apos;ll be redirected to PayPal to complete your purchase
              </p>
              {/* Stripe's element must stay mounted for the redirect to work — kept invisible. */}
              {session && (
                <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
                  <PaymentFields onComplete={(done) => setCardCompleteFor(done ? session.clientSecret : null)} />
                </div>
              )}
            </div>
          )}
          {methodRow("klarna", "Klarna", <KlarnaLogo />)}
          {payMethod === "klarna" && (
            <div className="relative border-t border-[#dedede] bg-black/[0.04] px-3.5 py-4">
              <p className="text-center text-sm text-black">
                You&apos;ll be redirected to Klarna to complete your purchase
              </p>
              {/* Stripe's element must stay mounted for the redirect to work — kept invisible. */}
              {session && (
                <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
                  <PaymentFields onComplete={(done) => setCardCompleteFor(done ? session.clientSecret : null)} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Billing address — for every payment method. */}
      <div className="flex flex-col gap-3.5 rounded-[12px] border border-[#dedede] bg-[#f6f6f6] p-3.5 text-black">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={billingSame}
            onChange={(e) => setForm({ billingSame: e.target.checked })}
            className="size-[18px] shrink-0 cursor-pointer accent-black"
          />
          Use shipping address as billing address
        </label>
        {billingFields}
      </div>
    </div>
  );

  // ── Final action (same checks for every method; PayPal/Klarna then redirect) ──
  const placeOrderArea = (
    <div className="flex flex-col gap-4">
      {termsBox}
      {termsError && (
        <p role="alert" className="-mt-2 text-xs text-[#ffb4b4]">
          {termsError}
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {!paymentStatus &&
        (session ? (
          <>
            <CardPlaceOrder
              // Greyed out until every required field is valid, the terms are
              // ticked and (for card) the card details are complete.
              canPay={readyToPay}
              prepare={preparePayment}
              label={METHOD_ACTION[payMethod].label}
              busyLabel={METHOD_ACTION[payMethod].busy}
              className="h-[52px] rounded-[12px] bg-accent text-accent-foreground hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-accent/45 disabled:text-white/80 disabled:opacity-100 disabled:shadow-none"
            />
            {!readyToPay && <p className="-mt-2 text-center text-xs text-white/65">{payHint}</p>}
          </>
        ) : (
          <Button
            type="button"
            disabled
            className="h-[52px] w-full rounded-[12px] bg-accent/45 text-base text-white/80 disabled:opacity-100"
          >
            Loading secure payment…
          </Button>
        ))}
    </div>
  );

  const summary = (
    <OrderSummary
      lines={lines}
      installFees={installFees}
      extras={selectedExtras}
      totals={totals}
      vat={vat}
      postcodeValid={postcodeValid}
      toFreeDelivery={toFreeDelivery}
      hasQuoteOnlyItems={hasQuoteOnlyItems}
    />
  );

  return (
    <div className="min-h-dvh bg-[#454545] lg:bg-[linear-gradient(to_right,#454545_50%,#f5f5f5_50%)]">
      <div className="mx-auto grid max-w-[1160px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* ── Left: the form ── */}
        <div className="bg-[#454545] lg:border-r lg:border-[#787878]">
          <div className="ml-auto flex w-full max-w-[580px] flex-col px-4 pt-6 pb-10 sm:px-10 lg:pt-10">
            <header className="flex items-center justify-between pb-6">
              <Link href="/" className="rounded-md bg-white px-3 py-2" aria-label="Ocunio Energy home">
                <Image
                  src="/ocunio-energy-logo.png"
                  alt="Ocunio Energy"
                  width={135}
                  height={45}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
              <Link href="/cart" aria-label="Back to cart" className="text-white hover:text-white/80">
                <ShoppingBag className="size-6" />
              </Link>
            </header>

            {/* Mobile: collapsible order summary */}
            {!submitted && lines.length > 0 && (
              <div className="-mx-4 mb-6 bg-[#f5f5f5] sm:-mx-10 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSummaryOpen((o) => !o)}
                  className="flex w-full items-center justify-between px-4 py-4 text-sm sm:px-10"
                  aria-expanded={summaryOpen}
                >
                  <span className="flex items-center gap-1.5 text-[#0280a3]">
                    {summaryOpen ? "Hide" : "Show"} order summary
                    <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} />
                  </span>
                  <span className="text-base font-medium text-black">{formatCurrency(totals.total)}</span>
                </button>
                {summaryOpen && <div className="px-4 pb-6 sm:px-10">{summary}</div>}
              </div>
            )}

            {submitted ? (
              <div className="flex flex-col items-center gap-3 rounded-[12px] bg-white px-6 py-14 text-center text-black">
                <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 className="size-6 text-success" />
                </span>
                <p className="font-heading text-lg font-semibold">Thanks — we&apos;ve got your order</p>
                <p className="text-sm text-[#707070]">Your order reference</p>
                <p className="font-heading text-2xl font-semibold text-primary-ink">{reference}</p>
                <p className="max-w-sm text-sm text-[#707070]">
                  A member of the team will be in touch to confirm payment and book your installation. If it&apos;s
                  urgent,{" "}
                  <a
                    href={whatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    message us on WhatsApp
                  </a>
                  .
                </p>
                <Button nativeButton={false} render={<Link href="/" />}>
                  Back to home
                </Button>
                {needsSurvey && (
                  <div className="w-full pt-2">
                    <SurveyNextStep />
                  </div>
                )}
              </div>
            ) : lines.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-white/30 py-16 text-center">
                <ShoppingBag className="size-8 text-white/70" />
                <p className="text-lg font-medium text-white">Your cart is empty</p>
                <Button nativeButton={false} render={<Link href="/home-charging" />}>
                  Browse residential chargers
                </Button>
              </div>
            ) : (
              <form
                ref={formRef}
                noValidate
                onBlur={(e) => {
                  const name = (e.target as unknown as HTMLInputElement).name;
                  if (name) markTouched(name);
                }}
                className="flex flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Only quote-only carts submit the form ("Place Order");
                  // payable carts pay through Stripe.
                  if (!hasQuoteOnlyItems) return;
                  if (!defaults?.email && !showEmail) setGuestChosen(true);
                  if (!validateAll()) return;
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
                    clearForm();
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

                {/* Express checkout — the wallet supplies name, address and payment in one tap. */}
                {payable && stripeConfigured && (
                  <div className="flex flex-col">
                    <p className="text-center text-sm text-white/65">Express checkout</p>
                    <div className="pt-4">
                      {express.session ? (
                        <StripeCheckoutProvider
                          key={`express-${express.session.clientSecret}`}
                          clientSecret={express.session.clientSecret}
                          onSessionError={express.discard}
                        >
                          <ExpressWallets buttonHeight={48} />
                        </StripeCheckoutProvider>
                      ) : (
                        <WalletSkeleton />
                      )}
                    </div>
                    <div className="flex items-center py-5 text-sm text-white/65">
                      <span className="h-px flex-1 bg-[#787878]" />
                      <span className="px-3.5">OR</span>
                      <span className="h-px flex-1 bg-[#787878]" />
                    </div>
                  </div>
                )}

                {/* Contact */}
                <section className="flex flex-col gap-3.5">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-[20px] leading-6 font-medium text-white">Contact</h2>
                  </div>
                  {defaults?.email ? (
                    <AccountRow email={defaults.email} />
                  ) : (
                    <GuestOrSignIn guest={showEmail} onGuest={() => setGuestChosen(true)} />
                  )}
                  {/* Signed in: the account email is sent, not shown. */}
                  <div className={cn("grid gap-2.5", !showEmail && "hidden")}>
                    <FloatField label="Email" filled={email !== ""} error={err("email")}>
                      <Input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className={FIELD_INPUT}
                        value={email}
                        onChange={(e) => setForm({ email: e.target.value })}
                      />
                    </FloatField>
                  </div>
                </section>

                {/* Delivery */}
                <section className="mt-8 flex flex-col gap-3.5">
                  <h2 className="text-[20px] leading-6 font-medium text-white">
                    {hasInstallation ? "Delivery & installation" : "Delivery"}
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    <FloatField label="Country/Region" filled className="col-span-2">
                      <select
                        disabled
                        className={cn(FIELD_INPUT, "w-full appearance-none border disabled:opacity-100")}
                      >
                        <option>United Kingdom</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-black" />
                    </FloatField>
                    <FloatField label="First name" filled={firstName !== ""} error={err("firstName")}>
                      <Input
                        name="firstName"
                        required
                        autoComplete="given-name"
                        className={FIELD_INPUT}
                        value={firstName}
                        onChange={(e) => setForm({ firstName: e.target.value })}
                      />
                    </FloatField>
                    <FloatField label="Last name" filled={lastName !== ""} error={err("lastName")}>
                      <Input
                        name="lastName"
                        required
                        autoComplete="family-name"
                        className={FIELD_INPUT}
                        value={lastName}
                        onChange={(e) => setForm({ lastName: e.target.value })}
                      />
                    </FloatField>
                    <FloatField
                      label="Company (optional)"
                      filled={company !== ""}
                      className="col-span-2"
                      error={err("company")}
                    >
                      <Input
                        name="company"
                        autoComplete="organization"
                        className={FIELD_INPUT}
                        value={company}
                        onChange={(e) => setForm({ company: e.target.value })}
                      />
                    </FloatField>
                    <FloatField as="div" label="Postcode" filled={postcode !== ""} error={err("postcode")}>
                      <PostcodeInput
                        required
                        placeholder=""
                        className={FIELD_INPUT}
                        value={postcode}
                        onValueChange={(value) => setForm({ postcode: value })}
                      />
                    </FloatField>
                    <FloatField label="City" filled={city !== ""} error={err("city")}>
                      <Input
                        name="city"
                        required
                        autoComplete="address-level2"
                        className={FIELD_INPUT}
                        value={city}
                        onChange={(e) => setForm({ city: e.target.value, cityTyped: e.target.value.trim() !== "" })}
                      />
                    </FloatField>
                    <FloatField
                      as="div"
                      label={postcodeValid ? "Address" : "Address (enter your postcode first)"}
                      filled={address !== ""}
                      className="col-span-2"
                      error={err("address")}
                    >
                      <AddressLookup
                        postcode={postcode}
                        name="address"
                        required
                        autoComplete="address-line1"
                        placeholder=""
                        inputClassName={FIELD_INPUT}
                        value={address}
                        onValueChange={(value) => setForm({ address: value })}
                        onTown={(town) => !useCheckoutForm.getState().cityTyped && setForm({ city: town })}
                      />
                    </FloatField>
                    <FloatField
                      label="Apartment, suite, etc. (optional)"
                      filled={addressLine2 !== ""}
                      className="col-span-2"
                      error={err("addressLine2")}
                    >
                      <Input
                        name="addressLine2"
                        autoComplete="address-line2"
                        className={FIELD_INPUT}
                        value={addressLine2}
                        onChange={(e) => setForm({ addressLine2: e.target.value })}
                      />
                    </FloatField>
                    <div className="col-span-2">
                      <FloatField label="Phone" filled={phone !== ""} error={err("phone")}>
                        <Input
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          className={cn(FIELD_INPUT, "pr-10")}
                          value={phone}
                          onChange={(e) => setForm({ phone: e.target.value })}
                        />
                        <span
                          title="In case we need to contact you about your order or installation."
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-[#707070]"
                        >
                          <CircleHelp className="size-[18px]" />
                        </span>
                      </FloatField>
                    </div>
                  </div>
                </section>

                {/* Shipping method */}
                <section className="mt-6 flex flex-col gap-3.5">
                  <h2 className="text-base font-medium text-white">Shipping method</h2>
                  {postcodeValid ? (
                    <>
                      <div className="flex items-center gap-2.5 rounded-[12px] border border-[#dedede] bg-white p-3.5 text-black">
                        <Radio checked />
                        <Truck className="size-4 text-[#707070]" />
                        <span className="flex-1 text-sm">
                          {DELIVERY_LABEL}
                          <span className="block text-xs text-[#707070]">{DELIVERY_ESTIMATE}</span>
                        </span>
                        <span className="text-sm font-medium">
                          {totals.deliveryFee === 0 ? "FREE" : formatCurrency(totals.deliveryFee)}
                        </span>
                      </div>
                      {toFreeDelivery > 0 && (
                        <p className="text-xs text-white/65">
                          Free delivery on orders of {FREE_DELIVERY_FROM} or more — add {formatCurrency(toFreeDelivery)}{" "}
                          to qualify.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="rounded-[12px] bg-[#4c4c4c] p-4 text-center text-sm text-white/65">
                      Enter your shipping address to view available shipping methods.
                    </div>
                  )}
                  {hasInstallation && (
                    <div className="flex items-start gap-3 rounded-[12px] bg-[#4c4c4c] p-4 text-sm">
                      <Video className="mt-0.5 size-4 shrink-0 text-white" />
                      <div className="flex-1">
                        <p className="flex justify-between font-medium text-white">
                          Virtual self survey <span className="text-[#7ee2a8]">Free</span>
                        </p>
                        <p className="mt-0.5 text-white/65">
                          Photos and a short questionnaire, reviewed by our team before installation.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Extras */}
                {(selectedExtras.length > 0 || remainingExtras.length > 0) && (
                  <section className="mt-6 flex flex-col gap-3.5">
                    <h2 className="text-base font-medium text-white">
                      Extras <span className="text-sm font-normal text-white/70"></span>
                    </h2>
                    <ExtrasPicker
                      available={remainingExtras}
                      selected={selectedExtras}
                      onAdd={(id) => setForm({ extraIds: [...extraIds, id] })}
                      onRemove={(id) => setForm({ extraIds: extraIds.filter((x) => x !== id) })}
                    />
                  </section>
                )}

                {hasQuoteOnlyItems ? (
                  // Quote-only items have no price, so they can't be paid online —
                  // the order goes to the team for review instead.
                  <section className="mt-8 flex flex-col gap-4">
                    <p className="text-sm text-white/65">
                      No payment is taken online — this places your order for review, and we&apos;ll be in touch to
                      confirm payment and schedule installation.
                    </p>
                    {termsBox}
                    {termsError && (
                      <p role="alert" className="-mt-2 text-xs text-[#ffb4b4]">
                        {termsError}
                      </p>
                    )}
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    <Button
                      type="submit"
                      disabled={pending || !check.ok}
                      className="h-[52px] w-full rounded-[12px] bg-black text-base text-white hover:bg-black/85 disabled:bg-[#8a8a8a] disabled:text-white/85 disabled:opacity-100"
                    >
                      {pending ? "Placing order…" : "Place Order"}
                    </Button>
                  </section>
                ) : (
                  <div className="mt-8 flex flex-col gap-6">
                    {payable && stripeConfigured && session ? (
                      <StripeCheckoutProvider
                        key={`${payMethod}-${session.clientSecret}`}
                        clientSecret={session.clientSecret}
                        onSessionError={active.discard}
                      >
                        {paymentSection}
                        {placeOrderArea}
                      </StripeCheckoutProvider>
                    ) : (
                      <>
                        {paymentSection}
                        {placeOrderArea}
                      </>
                    )}
                  </div>
                )}
              </form>
            )}

            <footer className="mt-12 flex flex-wrap gap-x-3.5 gap-y-1 border-t border-[#787878] pt-3.5 text-sm text-[#d7d7d7]">
              <Link href="/terms-of-sale" className="hover:text-white">
                Refund policy
              </Link>
              <Link href="/delivery-information" className="hover:text-white">
                Shipping
              </Link>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy policy
              </Link>
              <Link href="/terms-of-sale" className="hover:text-white">
                Terms of service
              </Link>
            </footer>
          </div>
        </div>

        {/* ── Right: order summary (desktop) ── */}
        <aside className="hidden bg-[#f5f5f5] lg:block">
          <div className="sticky top-0 max-w-[480px] p-10">{!submitted && lines.length > 0 && summary}</div>
        </aside>
      </div>
    </div>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-[18px] shrink-0 rounded-full border",
        checked ? "border-[5.6px] border-black bg-white" : "border-[#dedede] bg-white",
      )}
    />
  );
}

function OrderSummary({
  lines,
  installFees,
  extras,
  totals,
  vat,
  postcodeValid,
  toFreeDelivery,
  hasQuoteOnlyItems,
}: {
  lines: NonNullable<ReturnType<typeof resolveCartItem>>[];
  extras: CheckoutExtra[];
  totals: CheckoutTotals;
  vat: number;
  postcodeValid: boolean;
  toFreeDelivery: number;
  hasQuoteOnlyItems: boolean;
  installFees: Record<string, number>;
}) {
  const rows = [
    ...lines.map((line) => {
      // Charger and installation shown separately when the fee is known.
      const split = installSplit(line.price, line.quantity, line.options, installFees[line.id]);
      return {
        key: line.id,
        image: line.image,
        name: line.name,
        detail:
          split.install > 0
            ? line.options?.cableLength
              ? `${line.options.cableLength} cable`
              : null
            : formatCartOptions(line.options),
        quantity: line.quantity,
        price:
          line.price == null ? "Quote" : formatCurrency(split.install > 0 ? split.product : line.price * line.quantity),
        install: split.install,
      };
    }),
    ...extras.map((extra) => ({
      key: extra.id,
      image: extra.image,
      name: extra.name,
      detail: "Extra",
      quantity: 1,
      price: formatCurrency(extra.price),
      install: 0,
    })),
  ];
  const installTotal = Math.round(rows.reduce((sum, row) => sum + row.install, 0) * 100) / 100;
  return (
    <div className="flex flex-col gap-5 text-black">
      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start gap-3.5">
            <span className="relative shrink-0">
              <span className="relative block size-16 overflow-hidden rounded-[16px] border-[1.6px] border-white bg-[#ececec] shadow-[0_0_0_0.5px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.06)]">
                <Image src={row.image} alt="" fill sizes="64px" className="object-contain p-1.5" />
              </span>
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-[8px] bg-[#333] text-xs font-medium text-white">
                {row.quantity}
              </span>
            </span>
            <span className="flex-1">
              <span className="flex justify-between gap-3">
                <span className="text-sm leading-[18.9px]">{row.name}</span>
                <span className="text-sm whitespace-nowrap">{row.price}</span>
              </span>
              {row.detail && <span className="block text-xs text-black/55">{row.detail}</span>}
              {row.install > 0 && (
                <span className="mt-1.5 flex justify-between gap-3 border-l-2 border-black/10 pl-2 text-xs text-black/70">
                  <span>Standard installation{row.quantity > 1 ? ` × ${row.quantity}` : ""}</span>
                  <span className="whitespace-nowrap">{formatCurrency(row.install)}</span>
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-1.5 text-sm">
        {installTotal > 0 ? (
          <>
            <div className="flex justify-between">
              <dt>Chargers &amp; products</dt>
              <dd>{formatCurrency(Math.round((totals.subtotal - installTotal) * 100) / 100)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Installation</dt>
              <dd>{formatCurrency(installTotal)}</dd>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(totals.subtotal)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className={postcodeValid ? "" : "text-black/55"}>
            {!postcodeValid
              ? "Enter shipping address"
              : totals.deliveryFee === 0
                ? "FREE"
                : formatCurrency(totals.deliveryFee)}
          </dd>
        </div>
        {postcodeValid && toFreeDelivery > 0 && (
          <p className="text-xs text-black/55">Spend {formatCurrency(toFreeDelivery)} or more for free delivery.</p>
        )}
        <div className="mt-3 flex items-baseline justify-between">
          <dt className="text-lg font-medium">Total</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-xs text-black/55">GBP</span>
            <span className="text-lg font-medium">{formatCurrency(totals.total)}</span>
          </dd>
        </div>
        <p className="text-sm text-black/55">Including {formatCurrency(vat)} in taxes</p>
        {hasQuoteOnlyItems && (
          <p className="mt-2 text-xs text-black/55">
            Some items don&apos;t have a fixed price yet — we&apos;ll confirm the full total when we&apos;re in touch.
          </p>
        )}
      </dl>
    </div>
  );
}
