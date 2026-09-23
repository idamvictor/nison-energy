"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, GitCompare, Heart } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommercialProduct } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { tagClass } from "@/components/workplace-charging/commercial-product-tag";
import { useWishlist } from "@/lib/wishlist/store";

export function CommercialProductCard({
  variants,
  compareIds,
  onToggleCompare,
}: {
  variants: CommercialProduct[];
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
}) {
  const product = variants.reduce((a, b) => (b.price < a.price ? b : a));
  const compareSelected = compareIds?.includes(product.id);

  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const href = `/workplace-charging/${product.id}`;

  return (
    <Card className="group relative h-full gap-0 overflow-hidden py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
      <Link href={href} className="absolute inset-0 z-0" aria-label={product.name}>
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
          {product.tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} className={tagClass(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(product.id)}
                aria-pressed={Boolean(compareSelected)}
                aria-label={compareSelected ? "Remove from compare" : "Add to compare"}
                title={compareSelected ? "Remove from compare" : "Add to compare"}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full shadow-sm ring-1 transition-colors",
                  compareSelected
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-white/95 text-foreground/60 ring-border hover:bg-white"
                )}
              >
                {compareSelected ? (
                  <Check className="size-4" />
                ) : (
                  <GitCompare className="size-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => toggle(product.id, "commercial")}
              aria-pressed={wishlisted}
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-border transition-colors hover:bg-white"
            >
              <Heart
                className={cn(
                  "size-4",
                  wishlisted
                    ? "fill-accent text-accent"
                    : "fill-none text-foreground/60"
                )}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-5">
        <CardTitle className="text-lg leading-snug">{product.name}</CardTitle>
        <p className="mt-auto text-2xl font-semibold text-foreground">
          £{product.price}
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            inc VAT
          </span>
        </p>
      </CardContent>
      <CardFooter className="relative z-10 border-t-0 bg-transparent p-5 pt-3">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="w-full justify-between border-primary/25 text-primary hover:bg-primary/5"
          render={<Link href={href} />}
        >
          View Details
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
