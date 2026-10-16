import { formatCurrency } from "@/lib/currency";
import { formatOff, type Sale } from "@/lib/catalog/sale";
import { cn } from "@/lib/utils";

/** Red "£X off" pill (product image corner, price block). */
export function SaleBadge({ sale, className }: { sale: Sale; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full bg-[#b3122e] px-2.5 py-1 text-xs font-bold text-white shadow-sm",
        className,
      )}
    >
      {formatOff(sale.off)}
    </span>
  );
}

/** The slashed pre-sale price, shown next to the current price. */
export function WasPrice({ amount, className }: { amount: number; className?: string }) {
  return (
    <s className={cn("font-normal text-muted-foreground decoration-1", className)}>
      <span className="sr-only">Was </span>
      {formatCurrency(amount)}
    </s>
  );
}
