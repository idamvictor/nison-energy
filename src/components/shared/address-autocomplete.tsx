"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";

export type AddressSuggestion = {
  label: string;
  road?: string;
  city?: string;
  postcode?: string;
};

type NominatimResult = {
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
};

// Free, keyless UK address lookup via OpenStreetMap's Nominatim — there's no
// free equivalent of Google Places/getAddress.io with the real Royal Mail
// address file behind it, so results here are community-sourced and can be
// incomplete or slightly off, unlike a paid UK-specific lookup service.
export function AddressAutocomplete({
  name = "addressLine1",
  required,
  onSelect,
}: {
  name?: string;
  required?: boolean;
  onSelect?: (suggestion: AddressSuggestion) => void;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (trimmed.length < 4) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams({
        q: trimmed,
        format: "jsonv2",
        addressdetails: "1",
        countrycodes: "gb",
        limit: "5",
      });
      fetch(`https://nominatim.openstreetmap.org/search?${params}`)
        .then((res) => res.json())
        .then((data: NominatimResult[]) => {
          setSuggestions(
            data.map((r) => ({
              label: r.display_name,
              road: r.address?.road,
              city: r.address?.city ?? r.address?.town ?? r.address?.village,
              postcode: r.address?.postcode,
            }))
          );
          setOpen(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        name={name}
        required={required}
        placeholder="Start typing your address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        className="pr-9"
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <MapPin className="size-4 text-muted-foreground" />
        )}
      </span>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setValue(suggestion.road ?? suggestion.label);
                setOpen(false);
                onSelect?.(suggestion);
              }}
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-foreground">{suggestion.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
