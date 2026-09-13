"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageOff, Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductGallery } from "@/components/shared/product-gallery";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import {
  accessoryPhases,
  accessoryStyles,
  connectionTypes,
  type ProductCategory,
  type ProductInput,
} from "@/lib/catalog/types";
import type { Product as ProductRow } from "@/generated/prisma/client";
import { saveProduct } from "@/lib/catalog/actions";

type Spec = { label: string; value: string };

function toCsv(values: string[]): string {
  return values.join(", ");
}
function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function toLines(values: string[]): string {
  return values.join("\n");
}
function fromLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
function toParas(values: string[]): string {
  return values.join("\n\n");
}
function fromParas(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  category,
  row,
}: {
  category: ProductCategory;
  row: ProductRow | null;
}) {
  const router = useRouter();
  const isNew = row === null;
  const adminBack =
    category === "Residential"
      ? "/admin/residential"
      : category === "Commercial"
        ? "/admin/commercial"
        : "/admin/accessories";

  const isCharger = category !== "Accessory";

  const [slug, setSlug] = useState(row?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [name, setName] = useState(row?.name ?? "");
  const [brand, setBrand] = useState(row?.brand ?? "");
  const [colour, setColour] = useState(row?.colour ?? "");
  const [cardImage, setCardImage] = useState(row?.cardImage ?? "");
  const [tags, setTags] = useState(toCsv(row?.tags ?? []));
  const [variantGroup, setVariantGroup] = useState(row?.variantGroup ?? "");
  const [active, setActive] = useState(row?.active ?? true);
  const [featured, setFeatured] = useState(row?.featured ?? false);
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));

  const [spec, setSpec] = useState(row?.spec ?? "");
  const [connectionType, setConnectionType] = useState(row?.connectionType ?? "");
  const [cableLength, setCableLength] = useState(row?.cableLength ?? "");
  const [powerOutput, setPowerOutput] = useState(row?.powerOutput ?? "");
  const [price, setPrice] = useState(row?.price != null ? String(row.price) : "");
  const [cableLengthOptions, setCableLengthOptions] = useState(
    toCsv(row?.cableLengthOptions ?? []),
  );
  const [compatibleTariffs, setCompatibleTariffs] = useState(
    toCsv(row?.compatibleTariffs ?? []),
  );

  const [style, setStyle] = useState(row?.style ?? "");
  const [phase, setPhase] = useState(row?.phase ?? "");
  const [lengthOptions, setLengthOptions] = useState(
    toCsv(row?.lengthOptions ?? []),
  );

  const [tagline, setTagline] = useState(row?.tagline ?? "");
  const [gallery, setGallery] = useState<string[]>(() => {
    const g = row?.gallery ?? [];
    return g.length > 0 ? g : [row?.cardImage ?? ""];
  });
  const [description, setDescription] = useState(toParas(row?.description ?? []));
  const [features, setFeatures] = useState(toLines(row?.features ?? []));
  const [specs, setSpecs] = useState<Spec[]>(() => {
    const s = (row?.specs as Spec[] | null) ?? [];
    return s.length > 0 ? s : [{ label: "", value: "" }];
  });
  const [warranty, setWarranty] = useState(row?.warranty ?? "");

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const galleryImages = gallery.filter((s) => s.trim() !== "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input: ProductInput = {
      category,
      name,
      brand,
      colour,
      cardImage,
      tags: fromCsv(tags),
      variantGroup: variantGroup.trim() || null,
      active,
      featured,
      sortOrder: Number(sortOrder) || 0,
      spec: isCharger ? spec.trim() || null : null,
      connectionType: isCharger ? connectionType || null : null,
      cableLength: isCharger ? cableLength.trim() || null : null,
      powerOutput: isCharger ? powerOutput.trim() || null : null,
      price: isCharger && price.trim() !== "" ? Number(price) : null,
      cableLengthOptions:
        category === "Residential" ? fromCsv(cableLengthOptions) : [],
      compatibleTariffs:
        category === "Residential" ? fromCsv(compatibleTariffs) : [],
      style: category === "Accessory" ? style || null : null,
      phase: category === "Accessory" ? phase || null : null,
      lengthOptions: category === "Accessory" ? fromCsv(lengthOptions) : [],
      tagline: tagline.trim() || null,
      gallery: galleryImages,
      description: fromParas(description),
      features: fromLines(features),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      warranty: warranty.trim() || null,
    };

    const finalSlug = (isNew ? slug || slugify(name) : row!.id).trim();

    startTransition(async () => {
      const result = await saveProduct(category, finalSlug, isNew, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(adminBack);
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <Link
          href={adminBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {galleryImages.length > 0 ? (
            <ProductGallery images={galleryImages} name={name || "Preview"} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-muted">
              <ImageOff className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            <Field label="Card / thumbnail image">
              <ImageUploadField
                value={cardImage}
                onChange={setCardImage}
                label="Card image"
              />
            </Field>
            <p className="pt-1 text-xs font-medium text-muted-foreground">
              Gallery images (detail page)
            </p>
            {gallery.map((src, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <ImageUploadField
                    value={src}
                    onChange={(url) =>
                      setGallery((prev) =>
                        prev.map((s, i) => (i === index ? url : s)),
                      )
                    }
                    label={`Gallery image ${index + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={gallery.length === 1}
                  onClick={() =>
                    setGallery((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <X />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit border-primary/25 text-primary hover:bg-primary/5"
              onClick={() => setGallery((prev) => [...prev, ""])}
            >
              <Plus />
              Add gallery image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="URL slug">
            <Input
              required
              disabled={!isNew}
              value={isNew && !slugTouched ? slug || slugify(name) : slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="e.g. easee-one"
            />
          </Field>
          <Field label="Product name">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Brand">
            <Input
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </Field>
          <Field label="Colour">
            <Input
              required
              value={colour}
              onChange={(e) => setColour(e.target.value)}
            />
          </Field>
          <Field label="Variant group (optional)">
            <Input
              value={variantGroup}
              onChange={(e) => setVariantGroup(e.target.value)}
              placeholder="Colour/variant siblings share this"
            />
          </Field>
          <Field label="Tags (comma separated)">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <Field label="Sort order">
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </Field>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Active (visible on storefront)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Featured on home page
            </label>
          </div>
        </CardContent>
      </Card>

      {isCharger && (
        <Card>
          <CardHeader>
            <CardTitle>Specification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Spec summary" className="sm:col-span-2">
              <Input
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="e.g. 7.4kW · Type 2 tethered · 5m cable"
              />
            </Field>
            <Field label="Connection type">
              <Select
                value={connectionType}
                onValueChange={(v) => v && setConnectionType(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  {connectionTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Power output">
              <Input
                value={powerOutput}
                onChange={(e) => setPowerOutput(e.target.value)}
                placeholder="e.g. 7.4kW"
              />
            </Field>
            <Field label="Cable length (optional)">
              <Input
                value={cableLength}
                onChange={(e) => setCableLength(e.target.value)}
                placeholder="e.g. 5m"
              />
            </Field>
            <Field label="Price (£, inc. VAT)">
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            {category === "Residential" && (
              <>
                <Field label="Cable length options (comma separated)">
                  <Input
                    value={cableLengthOptions}
                    onChange={(e) => setCableLengthOptions(e.target.value)}
                    placeholder="5m, 7.5m, 10m"
                  />
                </Field>
                <Field label="Compatible tariffs (comma separated)">
                  <Input
                    value={compatibleTariffs}
                    onChange={(e) => setCompatibleTariffs(e.target.value)}
                    placeholder="Octopus Energy, OVO Energy"
                  />
                </Field>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {category === "Accessory" && (
        <Card>
          <CardHeader>
            <CardTitle>Cable options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Style">
              <Select value={style} onValueChange={(v) => v && setStyle(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {accessoryStyles.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phase">
              <Select value={phase} onValueChange={(v) => v && setPhase(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {accessoryPhases.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Length options (comma separated)"
              className="sm:col-span-2"
            >
              <Input
                value={lengthOptions}
                onChange={(e) => setLengthOptions(e.target.value)}
                placeholder="5m, 10m"
              />
            </Field>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Accessories show &ldquo;Request a quote&rdquo; on the storefront —
              there is no price field.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detail page content</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Tagline">
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>
          <Field label="Description (blank line between paragraphs)">
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Features (one per line)">
            <Textarea
              rows={6}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </Field>
          <Field label="Warranty">
            <Input
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Specification table
            </p>
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={spec.label}
                  onChange={(e) =>
                    setSpecs((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, label: e.target.value } : s,
                      ),
                    )
                  }
                  placeholder="Label"
                />
                <Input
                  value={spec.value}
                  onChange={(e) =>
                    setSpecs((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, value: e.target.value } : s,
                      ),
                    )
                  }
                  placeholder="Value"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={specs.length === 1}
                  onClick={() =>
                    setSpecs((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <X />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit border-primary/25 text-primary hover:bg-primary/5"
              onClick={() =>
                setSpecs((prev) => [...prev, { label: "", value: "" }])
              }
            >
              <Plus />
              Add spec row
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6">
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href={adminBack} />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}
