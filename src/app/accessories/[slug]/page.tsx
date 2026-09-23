import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  getAccessoryCatalog,
  getProductRow,
  dbToAccessory,
  dbToDetail,
} from "@/lib/catalog/queries";
import { adminRoute } from "@/lib/catalog/types";
import { AdminEditLink } from "@/components/shared/admin-edit-link";
import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { ProductGallery } from "@/components/shared/product-gallery";
import { PartnerBadges } from "@/components/shared/partner-badges";
import { FreeDeliveryBadge } from "@/components/shared/free-delivery-badge";
import { BrandLogo } from "@/components/shared/brand-logo";
import { AccessoryPurchasePanel } from "@/components/accessories/accessory-purchase-panel";
import { AccessoryProductCard } from "@/components/accessories/accessory-product-card";
import { tagClass } from "@/components/accessories/accessory-product-tag";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAccessoryCatalog();
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getProductRow(slug);
  if (!row || row.category !== "Accessory") return {};

  return {
    title: `${row.name} | Ocunio Energy`,
    description: row.tagline ?? undefined,
  };
}

export default async function AccessoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getProductRow(slug);

  if (!row || row.category !== "Accessory" || !row.active) notFound();

  const product = dbToAccessory(row);
  const detail = dbToDetail(row);

  const catalog = await getAccessoryCatalog();
  const siblings = catalog.filter(
    (p) => p.variantGroup === product.variantGroup
  );
  const similar = catalog
    .filter(
      (p) => p.id !== product.id && p.variantGroup !== product.variantGroup
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
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/accessories" className="hover:text-foreground">
              Accessories
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
                  <AdminEditLink href={`${adminRoute.Accessory}/${product.id}`} />
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
                    <Badge key={tag} className={tagClass()}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <AccessoryPurchasePanel
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
            </TabsList>

            <TabsContent value="description" className="max-w-3xl py-6">
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
                  <AccessoryProductCard key={p.id} variants={[p]} />
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
