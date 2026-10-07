import { siAmericanexpress, siApplepay, siGooglepay, siKlarna, siPaypal, siVisa } from "simple-icons";

import { cn } from "@/lib/utils";

type Icon = { title: string; path: string; hex: string };

/** An official brand mark from simple-icons (24×24 viewBox), in its brand colour. */
function BrandIcon({ icon, className, color }: { icon: Icon; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={icon.title} className={cn("h-6 w-auto", className)}>
      <path d={icon.path} fill={color ?? `#${icon.hex}`} />
    </svg>
  );
}

export function ApplePayLogo({ className }: { className?: string }) {
  return <BrandIcon icon={siApplepay} className={cn("h-11", className)} color="#000000" />;
}

export function GooglePayLogo({ className }: { className?: string }) {
  return <BrandIcon icon={siGooglepay} className={cn("h-11", className)} color="#3c4043" />;
}

export function PayPalLogo({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="PayPal" className={cn("inline-flex items-center gap-1", className)}>
      <BrandIcon icon={siPaypal} className="h-5" />
      <span aria-hidden className="text-[17px] font-bold tracking-tight italic">
        <span className="text-[#003087]">Pay</span>
        <span className="text-[#009cde]">Pal</span>
      </span>
    </span>
  );
}

export function VisaLogo({ className }: { className?: string }) {
  return <BrandIcon icon={siVisa} className={cn("h-9", className)} />;
}

export function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 24" role="img" aria-label="Mastercard" className={cn("h-6 w-auto", className)}>
      <circle cx="13" cy="12" r="10" fill="#eb001b" />
      <circle cx="25" cy="12" r="10" fill="#f79e1b" />
      <path d="M19 4a10 10 0 0 1 0 16a10 10 0 0 1 0-16z" fill="#ff5f00" />
    </svg>
  );
}

export function AmexLogo({ className }: { className?: string }) {
  return <BrandIcon icon={siAmericanexpress} className={cn("h-7", className)} />;
}

/** Stripe wordmark (simple-icons only has the "S" mark). */
export function StripeLogo({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="Stripe" className={cn("text-[17px] font-bold tracking-tight text-[#635bff]", className)}>
      stripe
    </span>
  );
}

/** Klarna badge: black mark on Klarna pink. */
export function KlarnaLogo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Klarna"
      className={cn("inline-flex h-6 items-center rounded-[5px] bg-[#ffb3c7] px-1.5", className)}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-auto">
        <path d={siKlarna.path} fill="#0b051d" />
      </svg>
      <span aria-hidden className="ml-1 text-[12px] font-bold text-[#0b051d]">Klarna</span>
    </span>
  );
}
