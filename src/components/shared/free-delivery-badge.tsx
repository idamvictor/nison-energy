import { Truck } from "lucide-react";

export function FreeDeliveryBadge() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="flex h-7 items-center gap-1.5 rounded-full bg-success/10 px-3 text-xs font-semibold text-success">
        <Truck className="size-3.5" />
        Free Delivery
      </span>
    </div>
  );
}
