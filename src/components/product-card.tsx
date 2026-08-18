import Image from "next/image";
import { ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/stars";
import type { Product } from "@/lib/products";

const tagStyles: Record<string, string> = {
  "Nison recommends": "bg-primary text-primary-foreground border-transparent",
  "Free UK delivery": "bg-success text-success-foreground border-transparent",
  "5 year guarantee": "bg-success text-success-foreground border-transparent",
};

function tagClass(tag: string) {
  if (tagStyles[tag]) return tagStyles[tag];
  if (tag.startsWith("Save"))
    return "bg-accent text-accent-foreground border-transparent";
  return "bg-background/90 text-foreground";
}

export function ProductCard({ product }: { product: Product }) {
  const discountPct = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : null;

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
          {discountPct !== null && (
            <Badge className="absolute top-3 right-3 border-transparent bg-destructive text-white">
              Save {discountPct}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-5">
        <CardTitle className="text-lg leading-snug">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{product.spec}</p>
        <Stars rating={product.rating} reviewCount={product.reviewCount} />
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-foreground">
            £{product.price}
          </p>
          {product.compareAtPrice && (
            <p className="text-sm text-muted-foreground line-through">
              £{product.compareAtPrice}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent p-5 pt-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-between border-primary/25 text-primary hover:bg-primary/5"
        >
          Learn more
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
