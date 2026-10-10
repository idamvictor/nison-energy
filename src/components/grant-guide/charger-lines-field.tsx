"use client";

import { Lock, Plus, Trash2 } from "lucide-react";

import { ChargerPicker } from "@/components/grant-guide/charger-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChargerSelection, GuideCharger } from "@/lib/grant-guide/types";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** One charger on a quote: the product picked from the finder and how many units. */
export type ChargerLine = { sel: ChargerSelection | null; qty: string };

/** A charger line with its product resolved and its quantity parsed (≥ 1). */
export type PricedChargerLine = {
  productId: string;
  model: string;
  unitCost: number;
  qty: number;
};

export const emptyChargerLine = (sel: ChargerSelection | null = null): ChargerLine => ({ sel, qty: "1" });

/** Lines with a chosen charger, priced from the shop (ex VAT). Unpicked lines are skipped. */
export function pricedChargerLines(chargers: GuideCharger[], lines: ChargerLine[]): PricedChargerLine[] {
  return lines.flatMap((line) => {
    if (!line.sel) return [];
    const variant = chargers.find((c) => c.key === line.sel!.key)?.variants.find((v) => v.id === line.sel!.variantId);
    if (!variant) return [];
    return [
      {
        productId: variant.id,
        model: variant.name,
        unitCost: variant.priceExVat,
        qty: Math.max(parseInt(line.qty, 10) || 1, 1),
      },
    ];
  });
}

/** "2 × Evec VecSPRINT …; 1 × Easee One" — a readable one-liner for the admin quote view. */
export function chargerSummary(lines: PricedChargerLine[]): string {
  return lines.map((l) => `${l.qty} × ${l.model}`).join("; ");
}

/**
 * The quote form's chargers: one or more lines, each a charger picked from
 * the finder plus a quantity. Prices come from the shop and can't be edited.
 */
export function ChargerLinesField({
  chargers,
  defaultCategory,
  lines,
  onChange,
}: {
  chargers: GuideCharger[];
  defaultCategory: GuideCharger["category"];
  lines: ChargerLine[];
  onChange: (lines: ChargerLine[]) => void;
}) {
  const priced = (line: ChargerLine) => pricedChargerLines(chargers, [line])[0];
  const update = (i: number, patch: Partial<ChargerLine>) =>
    onChange(lines.map((line, j) => (j === i ? { ...line, ...patch } : line)));

  return (
    <div className="flex flex-col gap-4 sm:col-span-2">
      {lines.map((line, i) => {
        const p = priced(line);
        return (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-3">
            <ChargerPicker
              chargers={chargers}
              defaultCategory={defaultCategory}
              value={line.sel}
              onChange={(sel) => update(i, { sel })}
              label={lines.length > 1 ? `Charger ${i + 1}` : "Your charger"}
            />
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex w-36 flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={line.qty}
                  onChange={(e) => update(i, { qty: e.target.value.replace(/[^\d]/g, "") })}
                  aria-label={`Number of chargepoints for charger ${i + 1}`}
                />
              </label>
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Cost (ex VAT)</span>
                <p className="flex h-8 items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="size-3.5" />
                  {p ? (
                    <>
                      {gbp.format(p.unitCost)} each ·{" "}
                      <span className="font-semibold text-foreground">{gbp.format(p.unitCost * p.qty)}</span>
                    </>
                  ) : (
                    "Choose a charger first"
                  )}
                </p>
              </div>
              {lines.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => onChange(lines.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        className="w-fit gap-1.5"
        onClick={() => onChange([...lines, emptyChargerLine()])}
      >
        <Plus className="size-4" />
        Add another charger
      </Button>
    </div>
  );
}
