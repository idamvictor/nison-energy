"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const MAX_SUGGESTIONS = 8;

type Lookup = {
  postcode: string;
  lat: number;
  lon: number;
  town: string | null;
  streets: string[];
  houses: { line1: string; street: string }[];
};

type NominatimResult = {
  address?: { house_number?: string; house_name?: string; road?: string };
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const postcodeKey = (s: string) => s.replace(/\s+/g, "").toUpperCase();

/**
 * Address line 1 with suggestions limited to the postcode already entered.
 * Streets around the postcode (+ any mapped house numbers) come from
 * /api/address-lookup once per postcode, so suggestions while typing are
 * instant: "12" → "12 Elms Road", "12 Pritchatts Road"… A quick OpenStreetMap
 * search inside a small box around the postcode adds matches for typed street
 * names. Free map data has gaps, so typing the address by hand always works.
 */
export function AddressLookup({
  postcode,
  name = "address",
  required,
  defaultValue = "",
  autoComplete = "address-line1",
  onTown,
  value: controlledValue,
  onValueChange,
  placeholder: placeholderOverride,
  inputClassName,
}: {
  postcode: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  /** Town for the postcode, once known — the parent fills Town / City with it. */
  onTown?: (town: string) => void;
  /** Optional controlled value (e.g. kept in the saved checkout form). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Overrides the built-in hint (e.g. "" when a floating label is used). */
  placeholder?: string;
  inputClassName?: string;
}) {
  const listId = useId();
  const [innerValue, setInnerValue] = useState(defaultValue);
  const value = controlledValue ?? innerValue;
  const setValue = (next: string) => {
    if (controlledValue === undefined) setInnerValue(next);
    onValueChange?.(next);
  };
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const onTownRef = useRef(onTown);
  useEffect(() => {
    onTownRef.current = onTown;
  });

  // ── Postcode → streets / houses (one request per postcode) ──
  const key = UK_POSTCODE_RE.test(postcode.trim()) ? postcodeKey(postcode) : null;
  const [lookup, setLookup] = useState<{ key: string; data: Lookup | null } | null>(null);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/address-lookup?postcode=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Lookup>) : null))
      .then((data) => {
        setLookup({ key, data });
        if (data?.town) onTownRef.current?.(data.town);
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setLookup({ key, data: null });
      });
    return () => controller.abort();
  }, [key]);
  const data = key && lookup?.key === key ? lookup.data : null;
  const loading = key != null && lookup?.key !== key;

  // ── Typed street names → OSM search inside a ~0.8km box round the postcode ──
  const typed = value.trim();
  const [nearby, setNearby] = useState<{ q: string; lines: string[] }>({ q: "", lines: [] });
  const wantsSearch = data != null && /[a-z]{3,}/i.test(typed);
  useEffect(() => {
    if (!wantsSearch || !data) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const d = 0.005;
      const params = new URLSearchParams({
        q: typed,
        format: "jsonv2",
        addressdetails: "1",
        countrycodes: "gb",
        limit: "6",
        bounded: "1",
        viewbox: `${data.lon - d},${data.lat + d},${data.lon + d},${data.lat - d}`,
      });
      fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal: controller.signal })
        .then((res) => res.json() as Promise<NominatimResult[]>)
        .then((results) =>
          setNearby({
            q: typed,
            lines: results
              .map((r) => [r.address?.house_number ?? r.address?.house_name, r.address?.road].filter(Boolean).join(" "))
              .filter((line) => line && /\s/.test(line)),
          }),
        )
        .catch(() => {});
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [typed, wantsSearch, data]);

  // ── Suggestions, built locally on every keystroke ──
  const suggestions: string[] = [];
  if (data && typed) {
    const q = norm(typed);
    const add = (line: string) => {
      if (suggestions.length < MAX_SUGGESTIONS && !suggestions.some((s) => norm(s) === norm(line)) && norm(line) !== q) {
        suggestions.push(line);
      }
    };
    // 1. Mapped houses matching what's typed.
    for (const house of data.houses) if (norm(house.line1).startsWith(q)) add(house.line1);
    // 2. "{number or name} {street}" for the postcode's streets.
    const match = typed.match(/^(\d+[a-z]?(?:-\d+[a-z]?)?)\s*(.*)$/i);
    if (match) {
      const [, number, rest] = match;
      for (const street of data.streets) {
        if (!rest || norm(street).startsWith(norm(rest))) add(`${number} ${street}`);
      }
    } else {
      // A street typed on its own, or a house name ("Rose Cottage") → "Rose Cottage, Elms Road".
      for (const street of data.streets) {
        if (norm(street).startsWith(q)) add(street);
      }
      if (q.length >= 3 && !data.streets.some((street) => norm(street).startsWith(q))) {
        for (const street of data.streets.slice(0, 4)) add(`${typed}, ${street}`);
      }
    }
    // 3. OSM matches inside the postcode area.
    if (nearby.q === typed) for (const line of nearby.lines) add(line);
  }
  const showList = open && suggestions.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(line: string) {
    setValue(line);
    setOpen(false);
    setActive(-1);
  }

  const placeholder = !key
    ? "Enter your postcode first for suggestions"
    : loading
      ? "Finding streets near your postcode…"
      : "Start with your house number or name";

  return (
    <div ref={containerRef} className="relative">
      <Input
        name={name}
        required={required}
        placeholder={placeholderOverride ?? placeholder}
        value={value}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            pick(suggestions[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn("pr-9", inputClassName)}
      />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="size-4 text-muted-foreground" />
        )}
      </span>

      {showList && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {suggestions.map((line, index) => (
              <li
                key={line}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(line)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-foreground",
                  index === active && "bg-secondary",
                )}
              >
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                <span>
                  {line}
                  {data && <span className="text-muted-foreground">, {data.postcode}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
            Can&apos;t see it? Just type your full address.
          </p>
        </div>
      )}
    </div>
  );
}
