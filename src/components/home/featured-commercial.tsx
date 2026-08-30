import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { commercialProducts } from "@/lib/commercial-products";
import { CommercialProductCard } from "@/components/workplace-charging/commercial-product-card";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";

export function FeaturedCommercial({ limit = 3 }: { limit?: number }) {
  const products = commercialProducts.slice(0, limit);

  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Featured Commercial EV Chargers
            </h2>
            <p className="mt-3 text-muted-foreground">
              Scalable charging systems designed for workplaces, depots, and
              car parks.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={(index % 3) * 75}>
              <CommercialProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="gap-2 border-primary/25 text-primary hover:bg-primary/5"
              render={<Link href="/workplace-charging" />}
            >
              View all commercial chargers
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
