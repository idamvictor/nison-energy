import { MessageCircle } from "lucide-react";

import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export function ProductGrid() {
  return (
    <section id="chargers" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Home charging units
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every charger is professionally installed and backed by our
              certified engineer network.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={(index % 3) * 75}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

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
      </div>
    </section>
  );
}
