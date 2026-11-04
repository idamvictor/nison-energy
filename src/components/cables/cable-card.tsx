"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CableProduct } from "@/lib/catalog/types";
import { lengthValue } from "@/lib/catalog/cable-attrs";
import { cn } from "@/lib/utils";
import { tagClass } from "@/components/accessories/accessory-product-tag";
import { useWishlist } from "@/lib/wishlist/store";
import { saleOf } from "@/lib/catalog/sale";
import { SaleBadge } from "@/components/shared/sale-price";
import { QuickAddToCart } from "@/components/shared/quick-add-to-cart";
import { CardMeta } from "@/components/shared/card-meta";
import { CardPrice } from "@/components/shared/card-price";

/**
 * One card per cable product — or per meter tail family, where `variants` is
 * every pack size: the family title, "8 sizes · from …" and the lengths.
 */
export function CableCard({ variants, quickAdd }: { variants: CableProduct[]; quickAdd?: boolean }) {
  const product = variants.reduce((a, b) => (b.price < a.price ? b : a));
  const sale = saleOf(product.price, product.compareAtPrice);
  const family = variants.length > 1;
  const lengths = [...new Set(variants.map((v) => v.length).filter((l): l is string => !!l))].sort(
    (a, b) => lengthValue(a) - lengthValue(b),
  );

  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const href = `/cables/${product.id}`;
  const title = family ? product.family : product.name;

  return (
    <Card className="group relative h-full gap-0 overflow-hidden py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
      <Link href={href} className="absolute inset-0 z-[5]" aria-label={title}>
        <span className="sr-only">View {title}</span>
      </Link>
      <CardHeader className="p-0">
        <div className="relative aspect-4/3 w-full bg-white">
          <Image
            src={product.image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <Badge className="w-fit bg-foreground/85 text-background">{product.type}</Badge>
            {sale && <SaleBadge sale={sale} />}
            {product.tags.map((tag) => (
              <Badge key={tag} className={tagClass()}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {quickAdd && !family && (
              <QuickAddToCart
                snapshot={{
                  id: product.id,
                  category: "cables",
                  name: product.name,
                  brand: product.brand,
                  image: product.image,
                  price: product.price,
                }}
              />
            )}
            <button
              type="button"
              onClick={() => toggle(product.id, "cables")}
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
        <CardTitle className="text-lg leading-snug">{title}</CardTitle>
        {family && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">{variants.length} sizes ·</span>
            {lengths.map((length) => (
              <span
                key={length}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-semibold text-foreground/80 ring-1 ring-border"
              >
                {length}
              </span>
            ))}
          </div>
        )}
        <CardMeta warranty={product.warranty} />
        <div className="mt-auto">
          {family && <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">From</p>}
          <CardPrice price={product.price} sale={sale} trade />
        </div>
      </CardContent>
      <CardFooter className="relative z-10 border-t-0 bg-transparent p-5 pt-3">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="w-full justify-between"
          render={<Link href={href} />}
        >
          {family ? "Choose your size" : "View Details"}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
        </Button>
      </CardFooter>
    </Card>
  );
}
