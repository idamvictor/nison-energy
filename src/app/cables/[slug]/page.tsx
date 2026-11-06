import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronRight } from "lucide-react";

import { getCableCatalog, getProductRow, dbToCable, dbToDetail } from "@/lib/catalog/queries";
import { getDatasheetNames, warmDatasheet } from "@/lib/media/queries";
import { adminRoute, cableTypeSlug } from "@/lib/catalog/types";
import { lengthValue } from "@/lib/catalog/cable-attrs";
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
import { CablePurchasePanel } from "@/components/cables/cable-purchase-panel";
import { CableCard } from "@/components/cables/cable-card";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getCableCatalog();
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const row = await getProductRow(slug);
  if (!row || row.category !== "Cable") return {};
  return { title: `${row.name} | Ocunio Energy` };
}

/** "Title: detail" → bold title, then the detail. */
function TitledLine({ text }: { text: string }) {
  const i = text.indexOf(": ");
  if (i <= 0 || i > 60) return <>{text}</>;
  return (
    <span>
      <span className="font-semibold text-foreground">{text.slice(0, i)}:</span> {text.slice(i + 2)}
    </span>
  );
}

/**
 * Description paragraphs: "## " is a sub-heading and a run of "- " lines is a
 * bullet list (e.g. "Bundle Package Contents"); anything else a paragraph.
 */
function Description({ paragraphs }: { paragraphs: string[] }) {
  const blocks: ({ kind: "h"; text: string } | { kind: "p"; text: string } | { kind: "ul"; items: string[] })[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.startsWith("## ")) blocks.push({ kind: "h", text: paragraph.slice(3) });
    else if (paragraph.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.kind === "ul") last.items.push(paragraph.slice(2));
      else blocks.push({ kind: "ul", items: [paragraph.slice(2)] });
    } else blocks.push({ kind: "p", text: paragraph });
  }
  return (
    <div className="flex flex-col gap-4 text-foreground/80">
      {blocks.map((block, i) =>
        block.kind === "h" ? (
          <h2 key={i} className="mt-4 font-heading text-lg font-semibold text-foreground">
            {block.text}
          </h2>
        ) : block.kind === "ul" ? (
          <ul key={i} className="flex flex-col gap-2.5">
            {block.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <TitledLine text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <TitledLine text={block.text} />
          </p>
        ),
      )}
    </div>
  );
}

export default async function CableDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getProductRow(slug);

  if (!row || row.category !== "Cable" || !row.active) notFound();

  const product = dbToCable(row);
  const detail = dbToDetail(row);
  for (const url of detail.datasheets) warmDatasheet(url);
  const datasheetNames = await getDatasheetNames(detail.datasheets);

  const catalog = await getCableCatalog();
  // Meter tail packs: every size in this family, shortest first.
  const siblings = product.variantGroup
    ? catalog
        .filter((p) => p.variantGroup === product.variantGroup)
        .sort((a, b) => lengthValue(a.length) - lengthValue(b.length) || (a.core ?? "").localeCompare(b.core ?? ""))
    : [product];
  const isFamily = siblings.length > 1;

  // Other products, one card per family.
  const others = new Map<string, typeof catalog>();
  for (const p of catalog) {
    const key = p.variantGroup || p.id;
    if (key === (product.variantGroup || product.id)) continue;
    others.set(key, [...(others.get(key) ?? []), p]);
  }
  const similar = [...others.values()].slice(0, 3);

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
            <Link href="/cables" className="hover:text-foreground">
              Cables
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href={`/cables?type=${cableTypeSlug[product.type]}`} className="hover:text-foreground">
              {product.type}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{isFamily ? product.family : product.name}</span>
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
                    {isFamily ? product.family : product.name}
                  </h1>
                  <AdminEditLink href={`${adminRoute.Cable}/${product.id}`} />
                </div>
                {/* The selected pack's own title, word for word. */}
                {isFamily && <p className="mt-2 text-base font-medium text-foreground">{product.name}</p>}
                {detail.sku && <p className="mt-1 text-sm text-muted-foreground">SKU: {detail.sku}</p>}
                <FreeDeliveryBadge warranty={detail.warranty} />
                {product.type === "EV Ultra Install Kit" && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg border border-accent-strong/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden />
                    For use by qualified and competent electrical installers only.
                  </p>
                )}
              </div>

              <CablePurchasePanel product={product} siblings={siblings} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="description">
            <TabsList variant="line" className="border-b border-border">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specification">Specification</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Information</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              {detail.datasheets.length > 0 && (
                <TabsTrigger value="datasheet">{detail.datasheets.length === 1 ? "Datasheet" : "Datasheets"}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="py-6">
              <Description paragraphs={detail.description} />
              {detail.features.length > 0 && (
                <>
                  <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">Product Detail</h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {detail.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                        <TitledLine text={feature} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </TabsContent>

            <TabsContent value="specification" className="py-6">
              <SpecTable specs={detail.specs} />
            </TabsContent>

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
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">More Cables</h2>
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((group) => (
                  <CableCard key={group[0].variantGroup || group[0].id} variants={group} />
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
