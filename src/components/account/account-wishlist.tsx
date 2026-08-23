"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { products } from "@/lib/products";
import { commercialProducts } from "@/lib/commercial-products";
import { accessoryProducts } from "@/lib/accessory-products";
import { ProductCard } from "@/components/shared/product-card";
import { CommercialProductCard } from "@/components/workplace-charging/commercial-product-card";
import { AccessoryProductCard } from "@/components/accessories/accessory-product-card";

export function AccountWishlist() {
  const { items } = useWishlist();

  const savedIds = new Set(items.map((item) => item.id));
  const savedResidential = products.filter((p) => savedIds.has(p.id));
  const savedCommercial = commercialProducts.filter((p) => savedIds.has(p.id));
  const savedAccessories = accessoryProducts.filter((p) => savedIds.has(p.id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Heart className="size-5" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          Your wishlist is empty
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tap the heart on any charger or accessory to save it here for
          later.
        </p>
        <Button nativeButton={false} render={<Link href="/home-charging" />}>
          Browse residential chargers
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {savedResidential.length > 0 && (
        <WishlistSection title="Residential Chargers">
          {savedResidential.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </WishlistSection>
      )}
      {savedCommercial.length > 0 && (
        <WishlistSection title="Commercial Chargers">
          {savedCommercial.map((product) => (
            <CommercialProductCard key={product.id} product={product} />
          ))}
        </WishlistSection>
      )}
      {savedAccessories.length > 0 && (
        <WishlistSection title="Accessories">
          {savedAccessories.map((product) => (
            <AccessoryProductCard key={product.id} product={product} />
          ))}
        </WishlistSection>
      )}
    </div>
  );
}

function WishlistSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
