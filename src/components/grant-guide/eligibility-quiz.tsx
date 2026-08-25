"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Property = "own-flat" | "own-house" | "rent";
type Parking = "off" | "on";
type Ev = "has" | "ordered";
type Result = "pass" | "warn" | "fail";

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-foreground/80 hover:border-primary/40"
      )}
    >
      {label}
    </button>
  );
}

export function EligibilityQuiz({
  onPass,
  onShowOnStreetForm,
  onGetQuote,
  onReset,
}: {
  onPass: () => void;
  onShowOnStreetForm: () => void;
  onGetQuote: () => void;
  onReset: () => void;
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [parking, setParking] = useState<Parking | null>(null);
  const [ev, setEv] = useState<Ev | null>(null);

  const result: Result | null =
    property && parking && ev
      ? parking === "off" && property === "own-house"
        ? "fail"
        : parking === "on"
          ? "warn"
          : "pass"
      : null;

  // Matches the original behaviour: a "pass" reveals the full guide
  // immediately, no extra click needed — warn/fail need an explicit choice.
  useEffect(() => {
    if (result === "pass") onPass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  function handleAnswer<T>(setter: (v: T) => void, value: T) {
    setter(value);
    onReset();
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Property status
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Own a flat" active={property === "own-flat"} onClick={() => handleAnswer(setProperty, "own-flat")} />
            <Pill label="Own a house" active={property === "own-house"} onClick={() => handleAnswer(setProperty, "own-house")} />
            <Pill label="Renting" active={property === "rent"} onClick={() => handleAnswer(setProperty, "rent")} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Parking
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Off-street" active={parking === "off"} onClick={() => handleAnswer(setParking, "off")} />
            <Pill label="On-street" active={parking === "on"} onClick={() => handleAnswer(setParking, "on")} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            EV status
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Own an EV" active={ev === "has"} onClick={() => handleAnswer(setEv, "has")} />
            <Pill label="Ordered / on order" active={ev === "ordered"} onClick={() => handleAnswer(setEv, "ordered")} />
          </div>
        </div>
      </div>

      {result && result !== "pass" && (
        <>
          <div
            className={cn(
              "mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm",
              result === "warn" && "border-accent/30 bg-accent/5",
              result === "fail" && "border-destructive/30 bg-destructive/5"
            )}
          >
            {result === "warn" && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />}
            {result === "fail" && <X className="mt-0.5 size-4 shrink-0 text-destructive" />}

            {result === "warn" && (
              <p className="text-foreground/80">
                Likely eligible — but under the separate{" "}
                <strong className="text-foreground">On-Street Parking Grant</strong>,
                which requires local highways authority consent for a
                cross-pavement solution before applying. Check the
                requirements, or tell us where you&apos;re up to so we can
                guide you through that process instead.
              </p>
            )}
            {result === "fail" && (
              <p className="text-foreground/80">
                Standalone house owners with off-street parking aren&apos;t
                eligible for this grant — only flat owners and renters of any
                residential property qualify. Professional installation is
                still available without the grant.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {result === "warn" && (
              <>
                <Button nativeButton={false} render={<Link href="/ozev-grants/on-street-parking" />}>
                  Check the requirements
                </Button>
                <Button variant="outline" onClick={onShowOnStreetForm}>
                  Tell us where you&apos;re up to
                </Button>
              </>
            )}
            {result === "fail" && (
              <Button variant="outline" onClick={onGetQuote}>
                Get a quote anyway
              </Button>
            )}
          </div>
        </>
      )}

      {result === "pass" && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3.5 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-success" />
          <p className="text-foreground/80">
            Likely eligible for the Renters &amp; Flat Owners grant. Follow
            the guide below — nothing is charged until OZEV approves.
          </p>
        </div>
      )}
    </div>
  );
}
