import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  getCommercialCatalog,
  getProductRow,
  dbToCommercial,
  dbToDetail,
} from "@/lib/catalog/queries";
import { adminRoute } from "@/lib/catalog/types";
import { AdminEditLink } from "@/components/shared/admin-edit-link";
import {
  installationProcessMarkdown,
  deliveryPolicyMarkdown,
  returnsPolicyMarkdown,
} from "@/lib/content/legal";
import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { ProductGallery } from "@/components/shared/product-gallery";
import { PartnerBadges } from "@/components/shared/partner-badges";
import { FreeDeliveryBadge } from "@/components/shared/free-delivery-badge";
import { BrandLogo } from "@/components/shared/brand-logo";
import { CommercialPurchasePanel } from "@/components/workplace-charging/commercial-purchase-panel";
import { CommercialProductCard } from "@/components/workplace-charging/commercial-product-card";
import { tagClass } from "@/components/workplace-charging/commercial-product-tag";
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

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getCommercialCatalog();
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getProductRow(slug);
  if (!row || row.category !== "Commercial") return {};

  return {
    title: `${row.name} | Ocunio Energy`,
    description: row.tagline ?? undefined,
  };
}

export default async function CommercialProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductRow(slug);

  if (!row || row.category !== "Commercial" || !row.active) notFound();

  const product = dbToCommercial(row);
  const detail = dbToDetail(row);

  const catalog = await getCommercialCatalog();
  const siblings = product.variantGroup
    ? catalog.filter((p) => p.variantGroup === product.variantGroup)
    : [product];
  const similar = catalog
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
            <Link href="/workplace-charging" className="hover:text-foreground">
              Commercial Chargers
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
                <BrandLogo brand={product.brand} />
                <div className="mt-1 flex items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                    {product.name}
                  </h1>
                  <AdminEditLink href={`${adminRoute.Commercial}/${product.id}`} />
                </div>
                {detail.sku && (
                  <p className="mt-1 text-sm text-muted-foreground">SKU: {detail.sku}</p>
                )}
                <PartnerBadges tariffs={product.compatibleTariffs} />
                <FreeDeliveryBadge show={detail.freeDelivery} />
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

              <CommercialPurchasePanel
                product={product}
                warranty={detail.warranty}
                siblings={siblings}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="description">
            <TabsList variant="line" className="border-b border-border">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specification">Specification</TabsTrigger>
              <TabsTrigger value="installation">Installation</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Information</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="py-6">
              <div className="flex flex-col gap-4 text-foreground/80">
                {detail.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {detail.features.length > 0 && (
                <>
                  <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">
                    Features
                  </h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
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
                </>
              )}
            </TabsContent>

            <TabsContent value="specification" className="py-6">
              <div className="overflow-hidden rounded-xl border border-border">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                      <TableHead className="w-2/5">Specification</TableHead>
                      <TableHead>
                        <span className="sr-only">Value</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.specs.map((spec) => (
                      <TableRow key={spec.label}>
                        <TableCell className="text-muted-foreground">
                          {spec.label}
                        </TableCell>
                        <TableCell className="font-medium text-foreground whitespace-normal wrap-break-word">
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
                  Book Installation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/ozev-grant-guide/workplace-charging-scheme" />}
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
                  <CommercialProductCard key={p.id} product={p} />
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
