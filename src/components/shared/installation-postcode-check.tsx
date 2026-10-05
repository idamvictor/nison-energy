"use client";

import { useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkUkPostcode } from "@/lib/postcode";

/**
 * "Do you install here?" step shown when Standard installation is chosen.
 * Calls back with the confirmed postcode (or null while unchecked/invalid);
 * Add to Cart stays disabled until it's confirmed.
 */
export function InstallationPostcodeCheck({
  onChange,
}: {
  onChange: (postcode: string | null) => void;
}) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ ok: true; postcode: string; town: string | null } | { ok: false; reason: string } | null>(null);

  async function check() {
    if (!value.trim()) return;
    setChecking(true);
    const outcome = await checkUkPostcode(value);
    setChecking(false);
    if (outcome.valid) {
      setResult({ ok: true, postcode: outcome.postcode, town: outcome.town });
      onChange(outcome.postcode);
    } else {
      setResult({ ok: false, reason: outcome.reason });
      onChange(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      Installation postcode
      <div className="flex gap-2">
        <Input
          value={value}
          placeholder="e.g. SW1A 1AA"
          autoComplete="postal-code"
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            if (result) {
              setResult(null);
              onChange(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void check();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={check} disabled={checking || !value.trim()} className="shrink-0 gap-1.5">
          {checking ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
          Check
        </Button>
      </div>
      {result?.ok && (
        <p className="flex items-center gap-1.5 text-xs font-normal text-success">
          <Check className="size-3.5" />
          Great — we install at {result.postcode}
          {result.town ? ` (${result.town})` : ""}.
        </p>
      )}
      {result && !result.ok && <p className="text-xs font-normal text-destructive">{result.reason}</p>}
      {!result && (
        <p className="text-xs font-normal text-muted-foreground">
          Check we cover your address before adding installation.
        </p>
      )}
    </div>
  );
}
