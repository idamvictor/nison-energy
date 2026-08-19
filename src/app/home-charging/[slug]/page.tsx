import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { products } from "@/lib/products";
import { productDetails, standardInstallation } from "@/lib/product-details";
import { SiteHeader } from "@/components/site-header";
import { TrustBar } from "@/components/trust-bar";
import { SiteFooter } from "@/components/site-footer";
import { HelpSection } from "@/components/help-section";
import { ProductGallery } from "@/components/product-gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { TariffBadges } from "@/components/tariff-badges";
import { ProductCard, tagClass } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) return {};

  return {
    title: `${product.name} | Nison Energy`,
    description: productDetails[slug]?.tagline,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  const detail = productDetails[slug];

  if (!product || !detail) notFound();

  const similar = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (!product.variantGroup || p.variantGroup !== product.variantGroup)
    )
    .slice(0, 3);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/home-charging" className="hover:text-foreground">
              Residential Chargers
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <ProductGallery images={detail.gallery} name={product.name} />

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-medium tracking-wide text-primary uppercase">
                  {product.brand}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-2 text-muted-foreground">{detail.tagline}</p>
              </div>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} className={tagClass(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <TariffBadges tariffs={product.compatibleTariffs} />

              <PurchasePanel product={product} warranty={detail.warranty} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="features">
            <TabsList variant="line" className="border-b border-border">
              <TabsTrigger value="features">Product Features</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specification">Specification</TabsTrigger>
              <TabsTrigger value="installation">Installation</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="max-w-2xl py-6">
              <ul className="flex flex-col gap-2.5">
                {detail.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="description" className="max-w-3xl py-6">
              <div className="flex flex-col gap-4 text-foreground/80">
                {detail.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specification" className="py-6">
              <dl className="grid max-w-2xl grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
                {detail.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-4 border-b border-border py-3 sm:justify-start"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {spec.label}
                    </dt>
                    <dd className="text-sm font-medium text-foreground sm:ml-auto">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </TabsContent>

            <TabsContent value="installation" className="max-w-2xl py-6">
              <p className="text-foreground/80">
                Every charger includes a standard installation carried out by
                a NICEIC-qualified engineer:
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {standardInstallation.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </section>

        {similar.length > 0 && (
          <section className="bg-secondary">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                Similar Products
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
