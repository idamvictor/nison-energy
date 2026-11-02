import type { Sale } from "@/lib/catalog/sale";
import { formatCurrency } from "@/lib/currency";
import { WasPrice } from "@/components/shared/sale-price";

const exVatOf = (incVat: number) => Math.round((incVat / 1.2) * 100) / 100;

/**
 * A product card's price, with the slashed "was" price while on sale.
 * Consumer products lead with the inc-VAT price; `trade` products
 * (accessories, circuit protection) lead with ex VAT, as trade buyers price
 * jobs ex VAT. `mt-auto` keeps prices aligned along the bottom of a grid row.
 */
export function CardPrice({ price, sale, trade = false }: { price: number; sale?: Sale | null; trade?: boolean }) {
  const exVat = exVatOf(price);
  return (
    <div className="mt-auto">
      <p className="text-2xl font-semibold text-foreground">
        {formatCurrency(trade ? exVat : price)}
        {trade && <span className="ml-1.5 text-sm font-normal text-muted-foreground">Ex. VAT</span>}
        {sale && <WasPrice amount={trade ? exVatOf(sale.was) : sale.was} className="ml-2 text-base" />}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        ({formatCurrency(trade ? price : exVat)} {trade ? "Inc. VAT" : "Ex. VAT"})
      </p>
    </div>
  );
}
