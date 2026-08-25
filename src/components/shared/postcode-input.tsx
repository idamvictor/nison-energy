"use client";

import { useEffect, useRef, useState } from "react";
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
}: {
  name?: string;
  required?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 5) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    debounceRef.current = setTimeout(() => {
      fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}/validate`)
        .then((res) => res.json())
        .then((data) => setStatus(data.result ? "valid" : "invalid"))
        .catch(() => setStatus("idle"));
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className="relative">
      <Input
        name={name}
        required={required}
        placeholder="Postcode"
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
