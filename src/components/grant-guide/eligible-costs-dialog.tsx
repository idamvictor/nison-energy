"use client";

import { Check, Info, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  eligibleExpenditure,
  eligibleExpenditureIntro,
  ineligibleExpenditure,
  type ExpenditureItem,
} from "@/lib/content/eligible-expenditure";
import { cn } from "@/lib/utils";

function ItemList({ items, eligible }: { items: ExpenditureItem[]; eligible: boolean }) {
  const Icon = eligible ? Check : X;
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.title} className="flex gap-2.5 text-sm leading-snug">
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
              eligible ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="size-3" strokeWidth={3} />
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{item.title}:</span> {item.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * "What costs can I claim?" — opens OZEV's eligible / ineligible expenditure
 * rules, so customers know what belongs in their quote's cost lines.
 */
export function EligibleCostsDialog() {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-1 text-xs font-medium text-primary-ink underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
        <Info className="size-3.5" />
        What costs can I claim?
      </DialogTrigger>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-4 pr-12">
          <DialogTitle className="text-lg">Eligible &amp; ineligible expenditure</DialogTitle>
          <DialogDescription>{eligibleExpenditureIntro}</DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-5 py-5 md:grid-cols-2">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-success">Eligible — can be claimed</h3>
            <ItemList items={eligibleExpenditure} eligible />
          </section>
          <section>
            <h3 className="mb-3 text-sm font-semibold text-destructive">Ineligible — can&apos;t be claimed</h3>
            <ItemList items={ineligibleExpenditure} eligible={false} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
