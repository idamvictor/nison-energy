"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function useCounts<T extends string>(values: T[]) {
  return useMemo(() => {
    const counts = new Map<T, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return counts;
  }, [values]);
}

export function toggle<T>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/**
 * Set-valued filter state backed by a URL query param instead of useState, so
 * browser Back restores the exact filtered view instead of resetting it.
 * The setter's signature matches useState's functional setter, so existing
 * `onToggle={(v) => setBrands((s) => toggle(s, v))}` call sites don't change.
 */
export function useFilterParam(
  key: string,
): [Set<string>, (updater: (s: Set<string>) => Set<string>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = useMemo(() => {
    const raw = searchParams.get(key);
    return raw ? new Set(raw.split(",")) : new Set<string>();
  }, [searchParams, key]);

  const setValue = useCallback(
    (updater: (s: Set<string>) => Set<string>) => {
      const next = updater(value);
      const params = new URLSearchParams(searchParams.toString());
      if (next.size > 0) params.set(key, [...next].join(","));
      else params.delete(key);
      const qs = params.toString();
      // scroll: true — every filter change jumps back to the top of the
      // results, even from far down a long list. Browser Back/Forward is a
      // separate, native mechanism unaffected by this option.
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: true });
    },
    [value, searchParams, key, pathname, router],
  );

  return [value, setValue];
}

/** Same idea as useFilterParam, for the single "sort" value. */
export function useSortParam<T extends string>(
  defaultValue: T,
): [T, (v: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = (searchParams.get("sort") as T | null) ?? defaultValue;

  const setValue = useCallback(
    (v: T) => {
      const params = new URLSearchParams(searchParams.toString());
      if (v === defaultValue) params.delete("sort");
      else params.set("sort", v);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: true });
    },
    [searchParams, pathname, router, defaultValue],
  );

  return [value, setValue];
}

export function FilterGroup({
  value,
  title,
  items,
  selected,
  onToggle,
}: {
  value: string;
  title: string;
  items: { value: string; label: string; count: number }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="font-heading text-sm font-semibold text-foreground hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-2.5">
          {items.map(({ value: itemValue, label, count }) => (
            <label
              key={itemValue}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground/80">
                <input
                  type="checkbox"
                  checked={selected.has(itemValue)}
                  onChange={() => onToggle(itemValue)}
                  className="size-4 accent-primary"
                />
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
