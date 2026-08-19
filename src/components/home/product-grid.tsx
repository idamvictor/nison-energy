import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { products as allProducts } from "@/lib/products";
import { ProductCard } from "@/components/shared/product-card";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";

export function ProductGrid({
  limit,
  viewAllHref,
  title = "Residential Charging Units",
  subtitle = "Every charger is professionally installed and backed by our certified engineer network.",
}: {
  limit?: number;
  viewAllHref?: string;
  title?: string;
  subtitle?: string;
}) {
  const products = limit ? allProducts.slice(0, limit) : allProducts;

  return (
    <section id="chargers" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={(index % 3) * 75}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {viewAllHref ? (
          <Reveal>
            <div className="mt-12 flex justify-center">
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="gap-2 border-primary/25 text-primary hover:bg-primary/5"
                render={<Link href={viewAllHref} />}
              >
                View all residential chargers
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-primary/15 bg-secondary px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="font-heading text-lg font-semibold text-foreground">
                  Can&apos;t find what you&apos;re looking for?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our team can access a broader range including Andersen,
                  Tesla, Podpoint, Wallbox and more.
                </p>
              </div>
              <Button className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageCircle className="size-4" />
                Request a quote
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
