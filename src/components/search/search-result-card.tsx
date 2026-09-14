import Image from "next/image";
import Link from "next/link";
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
import { categoryRoute } from "@/lib/catalog/types";
import type { SearchResult } from "@/lib/search/types";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const categoryLabel: Record<SearchResult["category"], string> = {
  Residential: "Home Charging",
  Commercial: "Workplace Charging",
  Accessory: "Accessory",
};

export function SearchResultCard({ result }: { result: SearchResult }) {
  const href = `${categoryRoute[result.category]}/${result.id}`;

  return (
    <Card className="group relative h-full gap-0 overflow-hidden py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
      <Link href={href} className="absolute inset-0 z-0" aria-label={result.name}>
        <span className="sr-only">View {result.name}</span>
      </Link>
      <CardHeader className="p-0">
        <div className="relative aspect-4/3 w-full bg-white">
          <Image
            src={result.image}
            alt={result.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/95">
              {categoryLabel[result.category]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-5">
        <CardTitle className="text-lg leading-snug">{result.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{result.brand}</p>
        {result.snippet && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{result.snippet}</p>
        )}
        {result.price != null && (
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {currency.format(result.price)}
          </p>
        )}
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
