"use client";

import { Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StepDef = { id: string; label: string };

/** Basket ✓ → Customer → Delivery → Payment → Review. Done steps are clickable. */
export function CheckoutProgress({
  steps,
  current,
  doneUpTo,
  onSelect,
}: {
  steps: StepDef[];
  current: number;
  /** Highest step index the customer has completed (-1 = none). */
  doneUpTo: number;
  onSelect: (index: number) => void;
}) {
  const all = [{ id: "basket", label: "Basket" }, ...steps];
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1 text-sm sm:gap-2">
      {all.map((step, i) => {
        const index = i - 1; // basket is -1 (always done)
        const done = index < 0 || index <= doneUpTo;
        const active = index === current;
        const clickable = index >= 0 && (done || index === doneUpTo + 1) && !active;
        return (
          <li key={step.id} className="flex shrink-0 items-center gap-1 sm:gap-2">
            {i > 0 && <span className={cn("h-px w-5 sm:w-10", done || active ? "bg-primary" : "bg-border")} />}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect(index)}
              className={cn(
                "flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1",
                clickable && "hover:bg-secondary",
                !clickable && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-accent text-accent-foreground"
                    : done
                      ? "bg-primary-ink text-white"
                      : "bg-secondary text-muted-foreground ring-1 ring-border",
                )}
              >
                {done && !active ? <Check className="size-3.5" /> : index < 0 ? "" : index + 1}
              </span>
              <span className={cn("font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * One checkout step. Open: full content. Not open: a one-line summary with
 * "Edit" (if completed) — the content stays mounted but hidden, so typed form
 * values survive collapsing.
 */
export function StepPanel({
  number,
  title,
  open,
  done,
  summary,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  open: boolean;
  done: boolean;
  summary?: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card
      data-step-open={open || undefined}
      className={cn("scroll-mt-28 border shadow-md", open ? "border-foreground/25" : "border-foreground/12")}
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                open ? "bg-accent text-accent-foreground" : done ? "bg-primary-ink text-white" : "bg-secondary text-muted-foreground",
              )}
            >
              {done && !open ? <Check className="size-3.5" /> : number}
            </span>
            <h2 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h2>
          </div>
          {!open && done && (
            <button
              type="button"
              onClick={onEdit}
              className="text-sm font-medium text-primary-ink underline underline-offset-2 hover:text-foreground"
            >
              Edit
            </button>
          )}
        </div>
        {!open && done && summary && <div className="pl-8.5 text-sm text-muted-foreground">{summary}</div>}
        <div className={open ? "flex flex-col gap-4" : "hidden"}>{children}</div>
      </CardContent>
    </Card>
  );
}
