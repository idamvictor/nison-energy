import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { products } from "@/lib/products";
import { productDetails } from "@/lib/product-details";
import {
  installationProcessMarkdown,
  deliveryPolicyMarkdown,
  returnsPolicyMarkdown,
} from "@/lib/legal-content";
import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { ProductGallery } from "@/components/shared/product-gallery";
import { PurchasePanel } from "@/components/home-charging/purchase-panel";
import { TariffBadges } from "@/components/home-charging/tariff-badges";
import { ProductCard } from "@/components/shared/product-card";
import { tagClass } from "@/components/shared/product-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    title: `${product.name} | Ocunio Energy`,
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
              <TabsTrigger value="delivery">Delivery Policy</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="py-6">
              <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
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

            <TabsContent value="description" className="py-6">
              <div className="flex flex-col gap-4 text-foreground/80">
                {detail.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specification" className="py-6">
              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                      <TableHead>Specification</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.specs.map((spec) => (
                      <TableRow key={spec.label}>
                        <TableCell className="text-muted-foreground">
                          {spec.label}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {spec.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="installation" className="py-6">
              <BlogMarkdown content={installationProcessMarkdown} />
              <div className="mt-2 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                  nativeButton={false}
                  render={<Link href="/contact-us" />}
                >
                  Book Installation (£549)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/ozev-grant-guide" />}
                >
                  Check OZEV Grant Eligibility
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="py-6">
              <BlogMarkdown content={deliveryPolicyMarkdown} />
            </TabsContent>

            <TabsContent value="returns" className="py-6">
              <BlogMarkdown content={returnsPolicyMarkdown} />
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
