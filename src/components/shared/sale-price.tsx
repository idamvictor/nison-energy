import { formatCurrency } from "@/lib/currency";
import { formatOff, type Sale } from "@/lib/catalog/sale";
import { installWas } from "@/lib/orders/installation-sale";
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

/**
 * "+£499.00" for an installation option — plus the slashed pre-sale price
 * and an orange "Sale" pill while the installation sale runs.
 */
export function InstallFee({ fee, className }: { fee: number; className?: string }) {
  const was = installWas(fee);
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      +{formatCurrency(fee)}
      {was != null && (
        <>
          <WasPrice amount={was} className="text-xs" />
          <span className="rounded-full bg-accent-strong px-1.5 py-px text-[10px] font-semibold uppercase leading-4 text-accent-foreground">
            Sale
          </span>
        </>
      )}
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
