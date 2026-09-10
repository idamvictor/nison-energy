import Link from "next/link";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  muted: "bg-muted text-muted-foreground",
} as const;

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "primary",
  href,
  className,
  delta,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  href?: string;
  className?: string;
  delta?: { pct: number; label?: string };
}) {
  const body = (
    <Card
      className={cn(
        "gap-3 transition-all",
        href && "hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20",
        className
      )}
    >
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold text-foreground">
            {value}
          </p>
          {delta && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                delta.pct > 0
                  ? "text-success"
                  : delta.pct < 0
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {delta.pct > 0 ? (
                <TrendingUp className="size-3.5" />
              ) : delta.pct < 0 ? (
                <TrendingDown className="size-3.5" />
              ) : null}
              {delta.pct > 0 ? "+" : ""}
              {delta.pct}%
              {delta.label && (
                <span className="font-normal text-muted-foreground">
                  {delta.label}
                </span>
              )}
            </p>
          )}
          {subtext && (
            <p className="text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone]
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </CardContent>
    </Card>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}
