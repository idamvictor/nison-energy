import { Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tells the customer what to do in "Check Your Eligibility" and how far
 * they've got. Display only — it reads the guide's existing answers.
 */
export function EligibilityPrompt({ selected, total }: { selected: number; total: number }) {
  const done = selected >= total;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2.5">
      <p className="flex items-start gap-2 text-sm font-medium text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary-ink" />
        Select one option for each of the {total} questions below to check your eligibility.
      </p>
      <span
        aria-live="polite"
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
          done ? "bg-success/15 text-success" : "bg-card text-foreground/70 ring-1 ring-border",
        )}
      >
        {done ? (
          <>
            <Check className="size-3.5" />
            All selected
          </>
        ) : (
          `${selected} of ${total} selected`
        )}
      </span>
    </div>
  );
}
