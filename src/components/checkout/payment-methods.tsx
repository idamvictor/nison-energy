"use client";

import { cn } from "@/lib/utils";

export type PaymentMethod = "applegoogle" | "paypal" | "amazon" | "card";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  applegoogle: "Apple Pay / Google Pay",
  paypal: "PayPal",
  amazon: "Amazon Pay",
  card: "Debit / credit card",
};

/** Small text "logos" — no image assets, readable in both themes. */
export function Mark({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-1.5 text-[11px] font-bold tracking-tight ring-1 ring-foreground/10",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const METHOD_MARKS: Record<PaymentMethod, React.ReactNode> = {
  applegoogle: (
    <>
      <Mark className="bg-black text-white"> Pay</Mark>
      <Mark className="bg-white text-[#3c4043]">G Pay</Mark>
    </>
  ),
  paypal: <Mark className="bg-[#ffc439] text-[#003087]">PayPal</Mark>,
  amazon: <Mark className="bg-[#232f3e] text-white">amazon pay</Mark>,
  card: (
    <>
      <Mark className="bg-white text-[#1a1f71]">VISA</Mark>
      <Mark className="bg-white text-[#eb001b]">Mastercard</Mark>
      <Mark className="bg-[#2e77bc] text-white">AMEX</Mark>
    </>
  ),
};

const GROUPS: { title: string; hint: string; methods: { id: PaymentMethod; blurb: string }[] }[] = [
  {
    title: "Express checkout",
    hint: "Fast and secure — pay with your preferred wallet.",
    methods: [
      { id: "applegoogle", blurb: "Use the card saved in your Apple or Google wallet." },
      { id: "paypal", blurb: "Pay with your PayPal account (incl. Pay in 3)." },
      { id: "amazon", blurb: "Use the card and address saved with Amazon." },
    ],
  },
  {
    title: "Card payment",
    hint: "Pay securely with your debit or credit card.",
    methods: [{ id: "card", blurb: "Visa, Mastercard and American Express." }],
  },
];

/** Grouped radio list: Express (three wallets) and Card. */
export function PaymentMethods({
  value,
  onChange,
  cardSlot,
}: {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  /** Rendered inside the Card row when Card is selected (the card fields). */
  cardSlot?: React.ReactNode;
}) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="flex flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{group.title}</p>
            <p className="text-xs text-muted-foreground">{group.hint}</p>
          </div>
          {group.methods.map(({ id, blurb }) => {
            const selected = value === id;
            return (
              <div
                key={id}
                className={cn(
                  "rounded-xl border transition-colors",
                  selected ? "border-2 border-primary bg-primary/5" : "border-foreground/15 hover:border-primary/50",
                )}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(id)}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 text-left"
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                      selected ? "border-primary-ink" : "border-foreground/30",
                    )}
                  >
                    {selected && <span className="size-1.5 rounded-full bg-primary-ink" />}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{PAYMENT_METHOD_LABEL[id]}</span>
                  <span className="flex flex-wrap gap-1">{METHOD_MARKS[id]}</span>
                  <span className="basis-full pl-7 text-xs text-muted-foreground">{blurb}</span>
                </button>
                {id === "card" && selected && cardSlot && <div className="px-4 pb-4">{cardSlot}</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
