import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneClass = {
  primary: "bg-primary",
  accent: "bg-accent",
} as const;

export function FunnelBar({
  title,
  data,
  tone = "primary",
}: {
  title: string;
  data: { status: string; count: number }[];
  tone?: keyof typeof toneClass;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((n, d) => n + d.count, 0);

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{total} total</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {data.map((row) => (
          <div key={row.status} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
              {row.status}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
              <div
                className={cn("h-full rounded", toneClass[tone])}
                style={{ width: `${Math.max((row.count / max) * 100, row.count > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-heading text-sm font-semibold text-foreground">
              {row.count}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
