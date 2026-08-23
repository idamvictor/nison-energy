"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";

import { products, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const INSTALL_FEE = 499;
const EXTENDED_WARRANTY_FEE = 49;

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function PurchasePanel({
  product,
  warranty,
}: {
  product: Product;
  warranty: string;
}) {
  const router = useRouter();
  const [cableLength, setCableLength] = useState(product.cableLength ?? "");
  const [warrantyOption, setWarrantyOption] = useState<"standard" | "extended">(
    "standard"
  );
  const [installation, setInstallation] = useState<"standard" | "none">(
    "standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const devicePrice = product.price - INSTALL_FEE;
  const unitPrice =
    devicePrice +
    (installation === "standard" ? INSTALL_FEE : 0) +
    (warrantyOption === "extended" ? EXTENDED_WARRANTY_FEE : 0);
  const total = unitPrice * quantity;
  const totalExVat = Math.round(total / 1.2);

  const colourSiblings = product.variantGroup
    ? products.filter((p) => p.variantGroup === product.variantGroup)
    : [product];
  const cableLengthOptions = product.cableLengthOptions ??
    (product.cableLength ? [product.cableLength] : []);

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
          Colour
          <select
            value={product.id}
            onChange={(e) => router.push(`/home-charging/${e.target.value}`)}
            className={selectClass}
          >
            {colourSiblings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.colour}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Cable length
          {cableLengthOptions.length > 0 ? (
            <select
              value={cableLength}
              onChange={(e) => setCableLength(e.target.value)}
              className={selectClass}
            >
              {cableLengthOptions.map((length) => (
                <option key={length} value={length}>
                  {length}
                </option>
              ))}
            </select>
          ) : (
            <select value="na" disabled className={cn(selectClass, "text-muted-foreground")}>
              <option value="na">N/A — untethered</option>
            </select>
          )}
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Warranty option
          <select
            value={warrantyOption}
            onChange={(e) =>
              setWarrantyOption(e.target.value as "standard" | "extended")
            }
            className={selectClass}
          >
            <option value="standard">{warranty} (included)</option>
            <option value="extended">
              5 year extended warranty (+£{EXTENDED_WARRANTY_FEE})
            </option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Installation option
          <select
            value={installation}
            onChange={(e) =>
              setInstallation(e.target.value as "standard" | "none")
            }
            className={selectClass}
          >
            <option value="standard">
              Standard installation (+£{INSTALL_FEE})
            </option>
            <option value="none">No installation (device only)</option>
          </select>
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="mt-1.5">
          <QuantityStepper quantity={quantity} onChange={setQuantity} />
        </div>
      </div>

      <Button
        size="lg"
        className="h-12 w-full gap-1.5 bg-accent text-base text-accent-foreground hover:bg-accent/90"
        onClick={() => {
          addItem(product.id, "residential", quantity);
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
    </div>
  );
}
