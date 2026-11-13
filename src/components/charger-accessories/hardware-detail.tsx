import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getHardwareCatalog, getProductRow, dbToHardware, dbToDetail } from "@/lib/catalog/queries";
import { getDatasheetNames, warmDatasheet } from "@/lib/media/queries";
import { adminRoute, categoryRoute, mediaScopeLabel, type HardwareCategory } from "@/lib/catalog/types";
import { AdminEditLink } from "@/components/shared/admin-edit-link";
import { deliveryPolicyMarkdown, returnsPolicyMarkdown } from "@/lib/content/legal";
import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { ProductGallery } from "@/components/shared/product-gallery";
import { FreeDeliveryBadge } from "@/components/shared/free-delivery-badge";
import { ProductDatasheet } from "@/components/shared/product-datasheet";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SpecTable } from "@/components/shared/spec-table";
import { HardwarePurchasePanel } from "@/components/charger-accessories/hardware-purchase-panel";
import { HardwareCard } from "@/components/charger-accessories/hardware-card";
import { tagClass } from "@/components/accessories/accessory-product-tag";
import { Badge } from "@/components/ui/badge";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** generateStaticParams for /covers/[slug] and /mounts-and-posts/[slug]. */
export async function hardwareStaticParams(category: HardwareCategory) {
  const products = await getHardwareCatalog(category);
  return products.map((product) => ({ slug: product.id }));
}

export async function hardwareMetadata(category: HardwareCategory, slug: string): Promise<Metadata> {
  const row = await getProductRow(slug);
  if (!row || row.category !== category) return {};
  return {
    title: `${row.name} | Ocunio Energy`,
    description: row.description[0] ?? row.tagline ?? undefined,
  };
}

/** The product page shared by Accessories ▸ Covers and Accessories ▸ Mounts & Posts. */
export async function HardwareDetail({ category, slug }: { category: HardwareCategory; slug: string }) {
  const row = await getProductRow(slug);

  // A product moved to another category keeps working at its old link.
  if (row && row.active && row.category !== category) {
    permanentRedirect(`${categoryRoute[row.category]}/${row.id}`);
  }
  if (!row || row.category !== category || !row.active) notFound();

  const product = dbToHardware(row);
  const detail = dbToDetail(row);
  for (const url of detail.datasheets) warmDatasheet(url);
  const datasheetNames = await getDatasheetNames(detail.datasheets);

  const catalog = await getHardwareCatalog(category);
  const siblings = product.variantGroup
    ? catalog.filter((p) => p.variantGroup === product.variantGroup)
    : [product];
  // Other items in this section, one card per variant group.
  const similarGroups = new Map<string, typeof catalog>();
  for (const p of catalog) {
    if (product.variantGroup ? p.variantGroup === product.variantGroup : p.id === product.id) continue;
    const key = p.variantGroup || p.id;
    similarGroups.set(key, [...(similarGroups.get(key) ?? []), p]);
  }
  const similar = [...similarGroups.values()].slice(0, 3);
  const listHref = categoryRoute[category];
  const listLabel = mediaScopeLabel[category];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span>Accessories</span>
            <ChevronRight className="size-3.5" />
            <Link href={listHref} className="hover:text-foreground">
              {listLabel}
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
                  <AdminEditLink href={`${adminRoute[category]}/${product.id}`} />
                </div>
                {detail.sku && <p className="mt-1 text-sm text-muted-foreground">SKU: {detail.sku}</p>}
                <FreeDeliveryBadge warranty={detail.warranty} />
              </div>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} className={tagClass()}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <HardwarePurchasePanel product={product} siblings={siblings} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="description">
            <TabsList variant="line" className="border-b border-border">
              <TabsTrigger value="description">Description</TabsTrigger>
              {detail.specs.length > 0 && <TabsTrigger value="specification">Specification</TabsTrigger>}
              <TabsTrigger value="delivery">Delivery Information</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              {detail.datasheets.length > 0 && (
                <TabsTrigger value="datasheet">
                  {detail.datasheets.length === 1 ? "Datasheet" : "Datasheets"}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="py-6">
              <div className="flex flex-col gap-4 text-foreground/80">
                {detail.description.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              {detail.features.length > 0 && (
                <>
                  <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">Key Features</h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {detail.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>

            {detail.specs.length > 0 && (
              <TabsContent value="specification" className="py-6">
                <SpecTable specs={detail.specs} />
              </TabsContent>
            )}

            <TabsContent value="delivery" className="py-6">
              <BlogMarkdown content={deliveryPolicyMarkdown} />
            </TabsContent>

            <TabsContent value="returns" className="py-6">
              <BlogMarkdown content={returnsPolicyMarkdown} />
            </TabsContent>

            {detail.datasheets.length > 0 && (
              <TabsContent value="datasheet" className="py-6">
                <ProductDatasheet urls={detail.datasheets} names={datasheetNames} />
              </TabsContent>
            )}
          </Tabs>
        </section>

        {similar.length > 0 && (
          <section className="bg-secondary">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Similar Products</h2>
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((group) => (
                  <HardwareCard key={group[0].variantGroup || group[0].id} variants={group} />
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
