import { ArrowRight, Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const tileClasses: Record<Product["tone"], string> = {
  teal: "bg-gradient-to-br from-primary to-[color-mix(in_oklch,var(--primary),black_20%)]",
  orange:
    "bg-gradient-to-br from-accent to-[color-mix(in_oklch,var(--accent),black_15%)]",
  graphite:
    "bg-gradient-to-br from-foreground/80 to-[color-mix(in_oklch,var(--foreground),black_20%)]",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group h-full gap-0 py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20">
      <CardHeader className="p-0">
        <div
          className={cn(
            "relative flex aspect-4/3 items-center justify-center rounded-t-xl",
            tileClasses[product.tone]
          )}
        >
          {product.badge && (
            <Badge className="absolute top-3 left-3 border-transparent bg-background/90 text-foreground">
              {product.badge}
            </Badge>
          )}
          <Zap
            className="size-16 text-white/90 transition-transform duration-200 group-hover:scale-110"
            strokeWidth={1.5}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1 pt-4">
        <CardTitle className="text-base">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{product.spec}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {product.price}
        </p>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent p-4 pt-2">
        <Button
          variant="outline"
          className="w-full justify-between border-primary/25 text-primary hover:bg-primary/5"
        >
          Learn more
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
