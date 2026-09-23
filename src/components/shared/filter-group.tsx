"use client";

import { useMemo } from "react";

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
