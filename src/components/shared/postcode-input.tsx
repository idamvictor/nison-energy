"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Status = "idle" | "checking" | "valid" | "invalid";

// Real-time UK postcode format validation via postcodes.io — a free,
// keyless public API (no backend of our own needed). It only confirms the
// postcode is real and correctly formatted; it doesn't return individual
// addresses at that postcode — a true "pick your address from a list"
// autocomplete needs a paid lookup service (e.g. getAddress.io, Postcoder)
// which requires an API key we don't have.
export function PostcodeInput({
  name = "postcode",
  required,
  className,
  value: controlledValue,
  onValueChange,
  autoComplete = "postal-code",
  placeholder = "Postcode",
}: {
  name?: string;
  required?: boolean;
  className?: string;
  /** Optional controlled value (e.g. filled in from an address lookup). */
  value?: string;
  onValueChange?: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [innerValue, setInnerValue] = useState("");
  const value = controlledValue ?? innerValue;
  const setValue = (next: string) => {
    if (controlledValue === undefined) setInnerValue(next);
    onValueChange?.(next);
  };
  // Result of the last check, keyed by the value it was for — the status is
  // derived from it, so a stale answer never shows against a newer value.
  const [checked, setChecked] = useState<{ value: string; valid: boolean | null } | null>(null);
  const trimmed = value.trim();
  const status: Status =
    trimmed.length < 5
      ? "idle"
      : checked?.value !== trimmed
        ? "checking"
        : checked.valid == null
          ? "idle"
          : checked.valid
            ? "valid"
            : "invalid";

  useEffect(() => {
    if (trimmed.length < 5) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}/validate`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setChecked({ value: trimmed, valid: Boolean(data.result) }))
        .catch((err) => {
          if ((err as Error).name !== "AbortError") setChecked({ value: trimmed, valid: null });
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return (
    <div className="relative">
      <Input
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        className={cn("pr-9", className)}
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
        {status === "checking" && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        {status === "valid" && <Check className="size-4 text-success" />}
        {status === "invalid" && <X className="size-4 text-destructive" />}
      </span>
    </div>
  );
}
