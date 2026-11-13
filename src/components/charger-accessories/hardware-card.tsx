"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryRoute, categoryToCart, type HardwareProduct } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { tagClass } from "@/components/accessories/accessory-product-tag";
import { useWishlist } from "@/lib/wishlist/store";
import { saleOf } from "@/lib/catalog/sale";
import { SaleBadge } from "@/components/shared/sale-price";
import { QuickAddToCart } from "@/components/shared/quick-add-to-cart";
import { CardMeta } from "@/components/shared/card-meta";
import { CardPrice } from "@/components/shared/card-price";

/**
 * A Covers / Mounts & Posts card. Colour variants of one item (the fascias)
 * come in as `variants` and show as one card, priced from the cheapest.
 */
export function HardwareCard({
  variants,
  quickAdd,
}: {
  variants: HardwareProduct[];
  /** Homepage featured cards: a cart icon beside the wishlist heart. */
  quickAdd?: boolean;
}) {
  const product = variants.reduce((a, b) => (b.price < a.price ? b : a));
  const sale = saleOf(product.price, product.compareAtPrice);
  const cartCategory = categoryToCart[product.category];
  const colours = [...new Set(variants.map((v) => v.colour).filter(Boolean))];

  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const href = `${categoryRoute[product.category]}/${product.id}`;

  return (
    <Card className="group relative h-full gap-0 overflow-hidden py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
      <Link href={href} className="absolute inset-0 z-[5]" aria-label={product.name}>
        <span className="sr-only">View {product.name}</span>
      </Link>
      <CardHeader className="p-0">
        <div className="relative aspect-4/3 w-full bg-white">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          />
          {(sale || product.tags.length > 0) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {sale && <SaleBadge sale={sale} />}
              {product.tags.map((tag) => (
                <Badge key={tag} className={tagClass()}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {quickAdd && (
              <QuickAddToCart
                snapshot={{
                  id: product.id,
                  category: cartCategory,
                  name: product.name,
                  brand: product.brand,
                  image: product.image,
                  price: product.price,
                }}
              />
            )}
            <button
              type="button"
              onClick={() => toggle(product.id, cartCategory)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-border transition-colors hover:bg-white"
            >
              <Heart className={cn("size-4", wishlisted ? "fill-accent text-accent" : "fill-none text-foreground/60")} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-5">
        <CardTitle className="text-lg leading-snug">{product.name}</CardTitle>
        {colours.length > 1 && (
          <p className="text-sm text-muted-foreground">
            {colours.length} colours: {colours.join(", ")}
          </p>
        )}
        <CardMeta warranty={product.warranty} />
        <CardPrice price={product.price} sale={sale} trade />
      </CardContent>
      <CardFooter className="relative z-10 border-t-0 bg-transparent p-5 pt-3">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="w-full justify-between"
          render={<Link href={href} />}
        >
          View Details
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
        </Button>
      </CardFooter>
    </Card>
  );
}
