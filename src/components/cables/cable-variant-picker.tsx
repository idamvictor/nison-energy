"use client";

import { useRouter } from "next/navigation";

import type { CableProduct } from "@/lib/catalog/types";
import { lengthValue } from "@/lib/catalog/cable-attrs";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

const exVat = (incVat: number) => Math.round((incVat / 1.2) * 100) / 100;

/**
 * Meter tail packs: pick a length and a tails size, or tap a cell in the
 * "All packs" price grid. Each pack is its own product page, so a choice
 * switches the URL (like the colour / length pickers elsewhere).
 */
export function CableVariantPicker({ product, siblings }: { product: CableProduct; siblings: CableProduct[] }) {
  const router = useRouter();
  const lengths = [...new Set(siblings.map((p) => p.length).filter((v): v is string => !!v))].sort(
    (a, b) => lengthValue(a) - lengthValue(b),
  );
  const cores = [...new Set(siblings.map((p) => p.core).filter((v): v is string => !!v))].sort();
  const find = (length?: string, core?: string) => siblings.find((p) => p.length === length && p.core === core);

  const go = (target?: CableProduct) => {
    if (target && target.id !== product.id) router.replace(`/cables/${target.id}`, { scroll: false });
  };
  // Changing one axis keeps the other where that pack exists.
  const pickLength = (length: string) => go(find(length, product.core) ?? siblings.find((p) => p.length === length));
  const pickCore = (core: string) => go(find(product.length, core) ?? siblings.find((p) => p.core === core));

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="text-sm font-medium text-foreground">Length</legend>
        <div className="mt-2 grid grid-cols-4 gap-1 rounded-xl bg-secondary p-1 ring-1 ring-border">
          {lengths.map((length) => {
            const active = length === product.length;
            return (
              <button
                key={length}
                type="button"
                aria-pressed={active}
                onClick={() => pickLength(length)}
                className={cn(
                  "h-10 rounded-lg text-sm font-semibold transition-all",
                  active ? "bg-foreground text-background shadow-sm" : "text-foreground/70 hover:bg-background",
                )}
              >
                {length}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-foreground">Tails</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {cores.map((core) => {
            const active = core === product.core;
            return (
              <button
                key={core}
                type="button"
                aria-pressed={active}
                onClick={() => pickCore(core)}
                className={cn(
                  "flex flex-col items-start rounded-xl px-3.5 py-2.5 text-left ring-1 transition-all",
                  active ? "bg-accent/10 ring-2 ring-accent" : "bg-background ring-border hover:ring-foreground/30",
                )}
              >
                <span className="text-sm font-semibold text-foreground">{core} 6181Y</span>
                <span className="text-xs text-muted-foreground">+ 1 × 16mm² 6491X earth</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <p className="text-sm font-medium text-foreground">All packs</p>
        <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-border">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="w-[22%] px-3 py-2 text-left font-medium">Length</th>
                {cores.map((core) => (
                  <th key={core} scope="col" className="px-2 py-2 text-left font-medium">
                    {core}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lengths.map((length) => (
                <tr key={length} className="border-t border-border">
                  <th scope="row" className="px-3 py-1.5 text-left font-semibold text-foreground">
                    {length}
                  </th>
                  {cores.map((core) => {
                    const pack = find(length, core);
                    const active = pack?.id === product.id;
                    return (
                      <td key={core} className="p-1">
                        {pack ? (
                          <button
                            type="button"
                            onClick={() => go(pack)}
                            aria-pressed={active}
                            aria-label={`${length}, ${core}: ${formatCurrency(exVat(pack.price))} ex VAT`}
                            className={cn(
                              "flex w-full flex-col items-start rounded-lg px-2 py-1.5 text-left transition-colors",
                              active
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-secondary",
                            )}
                          >
                            <span className="font-semibold">{formatCurrency(exVat(pack.price))}</span>
                            <span className={cn("text-[11px]", active ? "text-accent-foreground/85" : "text-muted-foreground")}>
                              {formatCurrency(pack.price)} inc
                            </span>
                          </button>
                        ) : (
                          <span className="block px-2 text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Prices ex VAT per pack. Tap any price to choose that pack.</p>
      </div>
    </div>
  );
}
