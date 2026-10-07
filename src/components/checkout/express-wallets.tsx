"use client";

import { useState } from "react";
import { siApple, siGooglepay } from "simple-icons";

import { cn } from "@/lib/utils";
import { PayPalLogo } from "@/components/checkout/payment-logos";
import { ExpressCheckout, NONE, type AvailableWallets, type ExpressMethods } from "@/components/checkout/stripe-payment";

type Wallet = keyof AvailableWallets;

const WALLETS: Wallet[] = ["applePay", "googlePay", "paypal"];

const LABEL: Record<Wallet, string> = {
  applePay: "Apple Pay",
  googlePay: "Google Pay",
  paypal: "PayPal",
};

const UNAVAILABLE: Record<Wallet, string> = {
  applePay:
    "Apple Pay isn't available on this device or browser. Use Safari on an iPhone, iPad or Mac with a card in Apple Wallet — or pay by card instead.",
  googlePay:
    "Google Pay isn't available in this browser. Use Chrome with a card saved to Google Pay — or pay by card instead.",
  paypal: "PayPal isn't available right now. Please pay by card instead.",
};

function Glyph({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("w-auto", className)}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}

/** Branded stand-in for a wallet Stripe can't show here — explains why on click. */
function FallbackButton({
  wallet,
  onClick,
  height = 40,
}: {
  wallet: Wallet;
  onClick: () => void;
  /** Matches Stripe's real buttons in the same row. */
  height?: number;
}) {
  const style: Record<Wallet, string> = {
    applePay: "bg-black text-white",
    googlePay: "bg-black text-white",
    paypal: "bg-[#ffc439]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height }}
      aria-label={`Pay with ${LABEL[wallet]}`}
      className={cn(
        "flex h-10 items-center justify-center rounded-md transition-opacity hover:opacity-90",
        style[wallet],
      )}
    >
      {wallet === "applePay" && (
        <span className="flex items-center gap-1 text-[17px] font-medium">
          <Glyph path={siApple.path} className="mb-0.5 h-4" />
          Pay
        </span>
      )}
      {wallet === "googlePay" && <Glyph path={siGooglepay.path} className="h-10" />}
      {wallet === "paypal" && <PayPalLogo />}
    </button>
  );
}

/**
 * The Express Checkout row: Apple Pay, Google Pay and PayPal side by side,
 * always visible. Wallets this browser supports are Stripe's real buttons (the
 * wallet supplies name, address and payment); the rest are branded stand-ins
 * that say why they can't be used here. Must sit inside a StripeCheckoutProvider.
 */
const GRID: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };
const SPAN: Record<number, string> = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3" };

export function ExpressWallets({
  wallets = WALLETS,
  buttonHeight = 40,
}: {
  /** Which wallets to offer (e.g. just PayPal in the payment list). */
  wallets?: Wallet[];
  buttonHeight?: number;
}) {
  const [available, setAvailable] = useState<AvailableWallets | null>(null);
  const [notice, setNotice] = useState<Wallet | null>(null);
  const missing = available ? wallets.filter((w) => !available[w]) : [];
  // Apple/Google Pay "always" so they show on more browsers; PayPal on its own
  // availability (test mode, or live once activated in Stripe).
  const methods: ExpressMethods = {
    ...NONE,
    applePay: wallets.includes("applePay") ? "always" : "never",
    googlePay: wallets.includes("googlePay") ? "always" : "never",
    paypal: wallets.includes("paypal") ? "auto" : "never",
  };

  const realCount = available ? wallets.length - missing.length : 0;

  // One row, one slot per wallet: Stripe's real buttons share a cell spanning
  // as many slots as there are real buttons (so each matches a stand-in's
  // size), and the stand-ins fill the rest of the row.
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
      <div className={cn("grid gap-2", GRID[wallets.length])}>
        <div
          className={cn(
            realCount > 0 ? SPAN[realCount] : cn(SPAN[wallets.length], "h-0 overflow-hidden"),
          )}
        >
          <ExpressCheckout
            methods={methods}
            onWallets={setAvailable}
            maxColumns={wallets.length}
            buttonHeight={buttonHeight}
          />
        </div>
        {available == null
          ? wallets.map((wallet) => (
              <span
                key={wallet}
                aria-hidden
                style={{ height: buttonHeight }}
                className="animate-pulse rounded-md bg-foreground/10"
              />
            ))
          : missing.map((wallet) => (
              <FallbackButton key={wallet} wallet={wallet} height={buttonHeight} onClick={() => setNotice(wallet)} />
            ))}
      </div>
      {notice && (
        <p role="status" className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground/80 ring-1 ring-foreground/10">
          {UNAVAILABLE[notice]}
        </p>
      )}
    </div>
  );
}

/**
 * The same three buttons before express payment can start (e.g. no
 * installation option chosen yet) — tapping one says what's missing.
 */
export function WalletButtonsWaiting({ reason }: { reason: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {WALLETS.map((wallet) => (
          <FallbackButton key={wallet} wallet={wallet} onClick={() => setShown(true)} />
        ))}
      </div>
      {shown && (
        <p role="status" className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground/80 ring-1 ring-foreground/10">
          {reason}
        </p>
      )}
    </div>
  );
}

/** Three button-shaped placeholders while Stripe works out which wallets this browser has. */
export function WalletSkeleton({ count = WALLETS.length }: { count?: number }) {
  return (
    <div aria-hidden className={cn("mx-auto grid w-full max-w-xl gap-2", GRID[count])}>
      {WALLETS.slice(0, count).map((wallet) => (
        <span key={wallet} className="h-10 animate-pulse rounded-md bg-foreground/10" />
      ))}
    </div>
  );
}
