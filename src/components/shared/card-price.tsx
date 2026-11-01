import type { Sale } from "@/lib/catalog/sale";
import { formatCurrency } from "@/lib/currency";
import { WasPrice } from "@/components/shared/sale-price";

/**
 * A product card's price: the inc-VAT price large (with the slashed "was"
 * price while on sale) and the ex-VAT price smaller underneath, for trade
 * buyers. `mt-auto` keeps prices aligned along the bottom of a grid row.
 */
export function CardPrice({ price, sale }: { price: number; sale?: Sale | null }) {
  const exVat = Math.round((price / 1.2) * 100) / 100;
  return (
    <div className="mt-auto">
      <p className="text-2xl font-semibold text-foreground">
        {formatCurrency(price)}
        {sale && <WasPrice amount={sale.was} className="ml-2 text-base" />}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">({formatCurrency(exVat)} Ex. VAT)</p>
    </div>
  );
}
