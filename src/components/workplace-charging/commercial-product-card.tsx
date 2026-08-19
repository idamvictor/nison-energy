"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommercialProduct } from "@/lib/commercial-products";
import { cn } from "@/lib/utils";
import { tagClass } from "@/components/workplace-charging/commercial-product-tag";

export function CommercialProductCard({
  product,
}: {
  product: CommercialProduct;
}) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <Card className="group h-full gap-0 overflow-hidden py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
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
          <button
            type="button"
            onClick={() => setWishlisted((w) => !w)}
            aria-pressed={wishlisted}
            aria-label={
              wishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-border transition-colors hover:bg-white"
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
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-5">
        <CardTitle className="text-lg leading-snug">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{product.spec}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          £{product.price}
        </p>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent p-5 pt-3">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="w-full justify-between border-primary/25 text-primary hover:bg-primary/5"
          render={<Link href={`/workplace-charging/${product.id}`} />}
        >
          Learn more
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
