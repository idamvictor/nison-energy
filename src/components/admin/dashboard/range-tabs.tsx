"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

export function RangeTabs() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("range") ?? "30d";

  return (
    <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
      {RANGES.map((range) => {
        const active = range.value === current;
        return (
          <Link
            key={range.value}
            href={`${pathname}?range=${range.value}`}
            scroll={false}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {range.label}
          </Link>
        );
      })}
    </div>
  );
}
