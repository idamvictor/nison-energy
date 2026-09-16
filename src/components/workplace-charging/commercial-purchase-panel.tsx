"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Heart, ShieldCheck, Zap } from "lucide-react";

import type { CommercialProduct } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/lib/cart/store";
import { useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const OZEV_GRANT_GUIDE_URL =
  "https://nison-energy.vercel.app/ozev-grant-guide/workplace-charging-scheme";

export function CommercialPurchasePanel({
  product,
  warranty,
  siblings,
}: {
  product: CommercialProduct;
  warranty: string;
  siblings: CommercialProduct[];
}) {
  const router = useRouter();
  const [installation, setInstallation] = useState<"standard" | "none" | null>(null);
  const [installationOpen, setInstallationOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const installFee = product.installFee ?? 0;
  const unitPrice = product.price + (installation === "standard" ? installFee : 0);
  const total = unitPrice * quantity;
  const totalExVat = Math.round(total / 1.2);

  const colourSiblings =
    product.variantGroup && siblings.length > 0 ? siblings : [product];

  const installationLabel =
    installation === "standard"
      ? `Standard installation (+£${installFee})`
      : installation === "none"
        ? "No installation (device only)"
        : "Choose option";

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border p-5">
      <div>
        <p className="text-3xl font-semibold text-foreground">
          £{total}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            inc VAT
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          £{totalExVat} <span>ex VAT</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Colour / connection
          <select
            value={product.id}
            onChange={(e) =>
              router.push(`/workplace-charging/${e.target.value}`)
            }
            className={selectClass}
          >
            {colourSiblings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.colour} · {p.connectionType}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Cable length
          <select value="10m" disabled className={cn(selectClass, "text-muted-foreground")}>
            <option value="10m">10m (charger to fuse box)</option>
          </select>
        </label>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
          Installation option
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
                  Standard installation (+£{installFee})
                  {installation === "standard" && <Check className="size-4 text-primary" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInstallation("none");
                    setInstallationOpen(false);
                  }}
                  className="flex w-full items-center justify-between border-t border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  No installation (device only)
                  {installation === "none" && <Check className="size-4 text-primary" />}
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
      </div>

      {warranty && (
        <div className="flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">{warranty}</p>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-1.5">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
        </div>
      </div>

      <Button
        size="lg"
        disabled={installation === null}
        className="h-12 w-full gap-1.5 bg-accent text-base text-accent-foreground hover:bg-accent/90"
        onClick={() => {
          if (installation === null) return;
          addItem(
            {
              id: product.id,
              category: "commercial",
              name: product.name,
              brand: product.brand,
              image: product.image,
              price: unitPrice,
            },
            quantity,
            { installation },
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
        onClick={() => toggle(product.id, "commercial")}
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

      <a
        href={OZEV_GRANT_GUIDE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Zap className="size-4.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Pay £0 today. Get up to £500 funded by the UK government.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              No payment due until grant is approved.
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}
