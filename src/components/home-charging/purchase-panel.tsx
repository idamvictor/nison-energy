"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, Heart, Zap } from "lucide-react";

import type { Product } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { InstallationPostcodeCheck } from "@/components/shared/installation-postcode-check";
import { useCart } from "@/lib/cart/store";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PurchasePanel({
  product,
  siblings,
}: {
  product: Product;
  siblings: Product[];
}) {
  const router = useRouter();
  const [installation, setInstallation] = useState<"standard" | "none" | null>(null);
  const [installationOpen, setInstallationOpen] = useState(false);
  // Confirmed by the postcode check — required before adding installation.
  const [installPostcode, setInstallPostcode] = useState<string | null>(null);
  const needsPostcode = installation === "standard" && !installPostcode;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const installFee = product.installFee ?? 0;
  const unitPrice = product.price + (installation === "standard" ? installFee : 0);
  const total = unitPrice * quantity;
  const totalExVat = Math.round((total / 1.2) * 100) / 100;

  const colourSiblings =
    product.variantGroup && siblings.length > 0 ? siblings : [product];
  // A variantGroup can span both Tethered and Untethered rows (a real
  // product distinction, not cosmetic — see variant-grouping.ts) — restrict
  // to the current product's own connection type first, so an Untethered
  // page can never pick up a Tethered sibling's cable length or colour
  // options that only exist under the other connection type.
  const sameConnectionSiblings = colourSiblings.filter(
    (p) => p.connectionType === product.connectionType,
  );
  // When colours ALSO come in several cable lengths, the shop lists each colour
  // as its own product (same rule as groupByVariant) — so this page is locked
  // to its own colour and only the length is choosable. Otherwise one entry
  // per distinct colour.
  const hasLengthVariation =
    new Set(sameConnectionSiblings.map((p) => p.cableLength).filter(Boolean)).size > 1;
  const colourOptions = hasLengthVariation
    ? [product]
    : sameConnectionSiblings.filter(
        (p, i) => sameConnectionSiblings.findIndex((q) => q.colour === p.colour) === i,
      );
  // Lengths available for the currently selected colour, shortest first —
  // each length is now its own real, correctly-priced product row.
  const lengthSiblings = sameConnectionSiblings
    .filter((p) => p.colour === product.colour && p.cableLength)
    .sort((a, b) => parseFloat(a.cableLength ?? "0") - parseFloat(b.cableLength ?? "0"));
  // No recorded lengths (e.g. untethered) — hide the Cable length field
  // entirely and let Colour take the full row.
  const hasLengths = lengthSiblings.length > 0;

  const installationLabel =
    installation === "standard"
      ? `Standard installation (+${formatCurrency(installFee)})`
      : installation === "none"
        ? "No installation (charger only)"
        : "Select";

  return (
    <div className="flex flex-col gap-5 rounded-2xl border-2 border-foreground/10 bg-card p-6 shadow-[0_12px_40px_-16px_rgb(0_0_0/0.25)]">
      <div>
        <p className="text-3xl font-semibold text-foreground">
          {formatCurrency(total)}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            inc VAT
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(totalExVat)} <span>ex VAT</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label
          className={cn(
            "flex flex-col gap-1.5 text-sm font-medium text-foreground",
            !hasLengths && "sm:col-span-2",
          )}
        >
          Colour
          {colourOptions.length <= 1 ? (
            <div className={cn(selectClass, "flex items-center font-normal")}>{product.colour}</div>
          ) : (
          <select
            value={product.colour}
            onChange={(e) => {
              const candidates = sameConnectionSiblings.filter((p) => p.colour === e.target.value);
              const match =
                candidates.find((p) => p.cableLength === product.cableLength) ?? candidates[0];
              if (match) router.push(`/home-charging/${match.id}`, { scroll: false });
            }}
            className={selectClass}
          >
            {colourOptions.map((p) => (
              <option key={p.colour} value={p.colour}>
                {p.colour}
              </option>
            ))}
          </select>
          )}
        </label>

        {hasLengths && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Cable length
            <select
              value={product.id}
              onChange={(e) =>
                router.push(`/home-charging/${e.target.value}`, { scroll: false })
              }
              className={selectClass}
            >
              {lengthSiblings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.cableLength}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
          Add Installation
          <div className="relative">
            <button
              type="button"
              onClick={() => setInstallationOpen((open) => !open)}
              className={cn(
                selectClass,
                "flex items-center justify-between text-left font-normal",
                installation === null && "text-muted-foreground"
              )}
            >
              {installationLabel}
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  installationOpen && "rotate-180"
                )}
              />
            </button>

            {installationOpen && (
              <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setInstallation("standard");
                    setInstallationOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  Standard installation (+{formatCurrency(installFee)})
                  {installation === "standard" && <Check className="size-4 text-primary-ink" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInstallation("none");
                    setInstallationOpen(false);
                  }}
                  className="flex w-full items-center justify-between border-t border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  No installation (charger only)
                  {installation === "none" && <Check className="size-4 text-primary-ink" />}
                </button>
              </div>
            )}
          </div>
          {installation === null && (
            <p className="text-xs font-normal text-muted-foreground">
              Select an installation option to continue.
            </p>
          )}
        </div>

        {installation === "standard" && (
          <div className="sm:col-span-2">
            <InstallationPostcodeCheck onChange={setInstallPostcode} />
          </div>
        )}
      </div>


      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-1.5">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
        </div>
      </div>

      <Button
        size="lg"
        disabled={installation === null || needsPostcode}
        variant="cta"
        className="h-12 w-full gap-1.5 text-base"
        onClick={() => {
          if (installation === null || needsPostcode) return;
          addItem(
            {
              id: product.id,
              category: "residential",
              name: product.name,
              brand: product.brand,
              image: product.image,
              price: unitPrice,
            },
            quantity,
            {
              cableLength: product.cableLength,
              installation,
              ...(installation === "standard" && installPostcode ? { postcode: installPostcode } : {}),
            },
          );
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2000);
        }}
      >
        {added ? (
          <>
            <Check className="size-4" />
            Added to cart
          </>
        ) : (
          "Add to Cart"
        )}
      </Button>

      <button
        type="button"
        onClick={() => toggle(product.id, "residential")}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
      >
        <Heart
          className={cn(
            "size-4",
            wishlisted ? "fill-accent text-accent" : "fill-none"
          )}
        />
        {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </button>

      <Link
        href="/ozev-grant-guide"
        className="group flex items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary/10 px-4 py-3.5 transition-colors hover:bg-primary/15"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Zap className="size-4.5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-foreground">
              Pay £0 today. Get up to £500 funded by the UK government.
            </p>
            <p className="mt-0.5 text-xs text-foreground/75">
              No payment due until grant is approved.
            </p>
          </div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-primary-ink transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
