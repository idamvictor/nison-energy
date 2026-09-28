import { ShieldCheck, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeClass =
  "flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full pl-1.5 pr-4 text-sm font-semibold ring-1 ring-inset";

// Free Delivery + (optional) warranty pills. An auto-width inline grid with
// 1fr columns sizes both columns to the widest pill, so they always match.
export function FreeDeliveryBadge({ warranty }: { warranty?: string }) {
  return (
    <div
      className={cn(
        "mt-3 inline-grid gap-2",
        warranty ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      <span className={cn(badgeClass, "bg-success/10 text-success ring-success/20")}>
        <span className="flex size-6 items-center justify-center rounded-full bg-success/15">
          <Truck className="size-3.5" />
        </span>
        Free Delivery
      </span>
      {warranty && (
        <span className={cn(badgeClass, "bg-primary/10 text-primary-ink ring-primary/25")}>
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/15">
            <ShieldCheck className="size-3.5" />
          </span>
          {warranty} warranty
        </span>
      )}
    </div>
  );
}
