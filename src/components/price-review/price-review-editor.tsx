"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CheckCircle2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { formatPercentOff } from "@/lib/catalog/sale";
import { submitPriceReview } from "@/lib/pricing-review/actions";
import {
  MAX_PRICE,
  categoryLabels,
  exVatOf,
  incVatOf,
  regularOf,
  resolveChange,
  saleOfRow,
  type PriceChange,
  type PriceRow,
} from "@/lib/pricing-review/types";
import type { ProductCategory } from "@/lib/catalog/types";

const DRAFT_KEY = "ocunio-price-review-draft";

/** A typed ex-VAT price → a number, or null if empty / not a valid amount. */
function parsePrice(raw: string): number | null {
  const t = raw.replace(/[£,\s]/g, "");
  if (!t) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  const n = Number(t);
  return n > 0 && n <= MAX_PRICE ? n : NaN;
}

export function PriceReviewEditor({ rows }: { rows: PriceRow[] }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [sales, setSales] = useState<Record<string, string>>({});
  const [ended, setEnded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [showSubmit, setShowSubmit] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  // Keep work-in-progress across a refresh (this browser only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as Record<string, unknown>;
        // Older drafts were just { productId: exVat }.
        const isNew = draft && typeof draft.prices === "object" && draft.prices !== null;
        /* eslint-disable react-hooks/set-state-in-effect -- one-off restore from localStorage */
        setInputs((isNew ? draft.prices : draft) as Record<string, string>);
        setSales((isNew ? (draft.sales ?? {}) : {}) as Record<string, string>);
        setEnded((isNew ? (draft.ended ?? {}) : {}) as Record<string, boolean>);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // storage unavailable — start fresh
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ prices: inputs, sales, ended }));
    } catch {
      // ignore
    }
  }, [inputs, sales, ended]);

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  // A change = a valid new normal and/or sale price that differs from today's.
  const { changes, invalid } = useMemo(() => {
    const changes: PriceChange[] = [];
    const invalid = new Map<string, string>();
    const ids = new Set([...Object.keys(inputs), ...Object.keys(sales), ...Object.keys(ended)]);
    for (const id of ids) {
      const row = byId.get(id);
      if (!row) continue;
      const ex = parsePrice(inputs[id] ?? "");
      const sale = ended[id] ? null : parsePrice(sales[id] ?? "");
      if (Number.isNaN(ex) || Number.isNaN(sale)) {
        invalid.set(id, "Not a valid amount");
        continue;
      }
      const change: PriceChange = {
        productId: id,
        ...(ex !== null ? { exVat: ex } : {}),
        ...(ended[id] ? { saleExVat: null } : sale !== null ? { saleExVat: sale } : {}),
      };
      if (change.exVat === undefined && change.saleExVat === undefined) continue;
      const resolved = resolveChange(row, change);
      if ("error" in resolved) invalid.set(id, resolved.error);
      else if (resolved.changed) changes.push(change);
    }
    return { changes, invalid };
  }, [inputs, sales, ended, byId]);
  const changedIds = new Set(changes.map((c) => c.productId));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (category === "all" || r.category === category) && (!q || `${r.name} ${r.sku ?? ""}`.toLowerCase().includes(q)),
    );
  }, [rows, query, category]);

  const groups = (Object.keys(categoryLabels) as ProductCategory[])
    .map((c) => ({ category: c, rows: filtered.filter((r) => r.category === c) }))
    .filter((g) => g.rows.length > 0);

  function submit() {
    setError(null);
    if (invalid.size > 0) return setError("Some new prices aren't valid amounts — please check the highlighted rows.");
    if (changes.length === 0) return setError("You haven't changed any prices yet.");
    if (!name.trim()) return setError("Please enter your name.");
    startTransition(async () => {
      const res = await submitPriceReview({ reviewerName: name, note, changes, website });
      if (!res.ok) return setError(res.error);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      setInputs({});
      setSales({});
      setEnded({});
      setSubmitted(res.count);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (submitted !== null) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <CheckCircle2 className="size-12 text-success" />
        <h1 className="text-2xl font-semibold">Thanks — submitted for approval</h1>
        <p className="text-muted-foreground">
          {submitted} price {submitted === 1 ? "change has" : "changes have"} been sent to Ocunio Energy. Nothing changes
          on the website until they&apos;re approved.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(null)}>
          Review prices again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 pb-32 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Price review</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Check each price and type a new <strong className="text-foreground">ex VAT</strong> price where it needs to
          change. The inc VAT price is calculated for you. Nothing changes on the website until it&apos;s approved.
        </p>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          To put a product on sale, type a <strong className="text-foreground">sale ex VAT</strong> price — the % off is
          calculated for you. Leave it blank to keep any current sale as it is.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product or SKU"
            className="bg-background pl-8"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory | "all")}
          className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {(Object.keys(categoryLabels) as ProductCategory[]).map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {groups.map((g) => (
        <section key={g.category} className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <h2 className="border-b border-border bg-muted/60 px-4 py-2.5 text-sm font-semibold">
            {categoryLabels[g.category]} <span className="font-normal text-muted-foreground">({g.rows.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Product</th>
                  <th className="px-3 py-2 text-left font-medium">SKU</th>
                  <th className="px-3 py-2 text-right font-medium">Current ex VAT</th>
                  <th className="px-3 py-2 text-right font-medium">Current inc VAT</th>
                  <th className="px-3 py-2 text-right font-medium">Current sale</th>
                  <th className="px-3 py-2 text-right font-medium">New ex VAT</th>
                  <th className="px-3 py-2 text-right font-medium">New inc VAT</th>
                  <th className="px-3 py-2 text-right font-medium">Sale ex VAT</th>
                  <th className="px-4 py-2 text-right font-medium">Sale inc VAT</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => {
                  const raw = inputs[r.id] ?? "";
                  const ex = parsePrice(raw);
                  const saleRaw = sales[r.id] ?? "";
                  const saleEx = parsePrice(saleRaw);
                  const isEnded = !!ended[r.id];
                  const bad = invalid.has(r.id);
                  const changed = changedIds.has(r.id);
                  const regular = regularOf(r);
                  const currentSale = saleOfRow(r);
                  // Live preview of the final prices (today's when left blank).
                  const newRegularInc = ex !== null && !Number.isNaN(ex) ? incVatOf(ex) : regular;
                  const newSaleInc = isEnded
                    ? null
                    : saleEx !== null && !Number.isNaN(saleEx)
                      ? incVatOf(saleEx)
                      : currentSale;
                  // Show the sale preview when it's being set, or when a new normal price changes its % off.
                  const saleTouched = isEnded || saleEx !== null || (ex !== null && currentSale != null);
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        changed && "bg-accent/8",
                        !r.active && "text-muted-foreground",
                      )}
                    >
                      <td className="min-w-64 px-4 py-2.5">
                        {r.name}
                        {!r.active && <span className="ml-1.5 text-xs">(not currently on sale)</span>}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{r.sku ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                        {regular == null ? "On request" : formatCurrency(exVatOf(regular))}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                        {regular == null ? "—" : formatCurrency(regular)}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap tabular-nums">
                        {currentSale == null || regular == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <>
                            {formatCurrency(currentSale)}
                            <span className="block text-xs font-medium text-accent-strong">
                              {formatPercentOff(regular, currentSale)}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="relative ml-auto w-32">
                          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">£</span>
                          <Input
                            inputMode="decimal"
                            value={raw}
                            onChange={(e) => setInputs((prev) => ({ ...prev, [r.id]: e.target.value }))}
                            placeholder={r.price == null ? "0.00" : exVatOf(r.price).toFixed(2)}
                            aria-label={`New ex VAT price for ${r.name}`}
                            aria-invalid={bad || undefined}
                            className="bg-background pl-6 text-right tabular-nums"
                          />
                        </div>
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-right whitespace-nowrap tabular-nums",
                          changed ? "font-semibold text-foreground" : "text-muted-foreground",
                        )}
                        aria-live="polite"
                      >
                        {ex !== null && !Number.isNaN(ex) ? formatCurrency(incVatOf(ex)) : "—"}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="relative ml-auto w-32">
                          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">£</span>
                          <Input
                            inputMode="decimal"
                            value={isEnded ? "" : saleRaw}
                            disabled={isEnded}
                            onChange={(e) => setSales((prev) => ({ ...prev, [r.id]: e.target.value }))}
                            placeholder={isEnded ? "Sale ended" : currentSale != null ? exVatOf(currentSale).toFixed(2) : "No sale"}
                            aria-label={`Sale ex VAT price for ${r.name}`}
                            aria-invalid={bad || undefined}
                            className="bg-background pl-6 text-right tabular-nums"
                          />
                        </div>
                        {(currentSale != null || isEnded) && (
                          <button
                            type="button"
                            onClick={() => setEnded((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                            className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                          >
                            {isEnded ? "Undo end sale" : "End sale"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap tabular-nums" aria-live="polite">
                        {bad ? (
                          <span className="text-xs font-medium whitespace-normal text-destructive">{invalid.get(r.id)}</span>
                        ) : isEnded ? (
                          <span className={cn(changed && "font-semibold text-foreground")}>No sale</span>
                        ) : saleTouched && newSaleInc != null && newRegularInc != null ? (
                          <>
                            <span className={cn(changed ? "font-semibold text-foreground" : "text-muted-foreground")}>
                              {formatCurrency(newSaleInc)}
                            </span>
                            <span className="ml-1.5 inline-flex rounded-full bg-accent-strong px-1.5 py-px text-[11px] font-semibold text-white">
                              {formatPercentOff(newRegularInc, newSaleInc)}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {showSubmit && (
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm">
          <h2 className="font-semibold">Submit for approval</h2>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Your name
            <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" autoFocus />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Note (optional)
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Anything we should know about these prices?" />
          </label>
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="cta" disabled={pending} onClick={submit}>
              {pending ? "Submitting…" : `Submit ${changes.length} ${changes.length === 1 ? "change" : "changes"}`}
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => setShowSubmit(false)}>
              Cancel
            </Button>
          </div>
        </section>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm">
            <span className="font-semibold">{changes.length}</span> {changes.length === 1 ? "change" : "changes"}
            {invalid.size > 0 && <span className="ml-2 text-destructive">· {invalid.size} to fix</span>}
          </p>
          <Button
            variant="cta"
            disabled={changes.length === 0}
            onClick={() => {
              setShowSubmit(true);
              setError(null);
              setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50);
            }}
          >
            Submit for approval
          </Button>
        </div>
      </div>
    </div>
  );
}
