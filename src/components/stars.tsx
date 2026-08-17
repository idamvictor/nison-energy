import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stars({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < Math.round(rating)
                ? "fill-accent text-accent"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
