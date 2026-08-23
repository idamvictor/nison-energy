"use client";

import { useState } from "react";
import Link from "next/link";
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
import type { Product } from "@/lib/products";
import type { CommercialProduct } from "@/lib/commercial-products";
import type { AccessoryProduct } from "@/lib/accessory-products";
import {
  catalogCategoryLabels,
  getCatalogItemGallery,
  type CatalogCategory,
  type CatalogItem,
} from "@/lib/admin-catalog";

export function ProductForm({
  category,
  item,
}: {
  category: CatalogCategory;
  item?: CatalogItem;
}) {
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState<string[]>(() => {
    const initial = item ? getCatalogItemGallery(item) : [];
    return initial.length > 0 ? initial : [""];
  });

  const residential = category !== "accessories" ? (item?.raw as Product | CommercialProduct | undefined) : undefined;
  const accessory = category === "accessories" ? (item?.raw as AccessoryProduct | undefined) : undefined;

  const nonEmptyImages = images.filter((src) => src.trim() !== "");

  function updateImage(index: number, value: string) {
    setImages((prev) => prev.map((src, i) => (i === index ? value : src)));
  }
  function addImage() {
    setImages((prev) => [...prev, ""]);
  }
  function removeImage(index: number) {
    setImages((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/admin/${category}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to {catalogCategoryLabels[category].toLowerCase()}
        </Link>
        {saved && (
          <p className="text-sm font-medium text-success">
            Saved for preview — nothing is persisted yet.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {nonEmptyImages.length > 0 ? (
            <ProductGallery images={nonEmptyImages} name={item?.name ?? "Product preview"} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-muted">
              <ImageOff className="size-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {images.map((src, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={src}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder={`Image URL ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={images.length === 1}
                  onClick={() => removeImage(index)}
                >
                  <X />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit border-primary/25 text-primary hover:bg-primary/5"
              onClick={addImage}
            >
              <Plus />
              Add another image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Product name">
            <Input required defaultValue={item?.name} placeholder="Product name" />
          </Field>
          <Field label="Brand">
            <Input required defaultValue={item?.brand} placeholder="Brand" />
          </Field>
          <Field label="Category">
            <Input disabled defaultValue={catalogCategoryLabels[category]} />
          </Field>
          <Field label="Colour">
            <Input defaultValue={item?.colour} placeholder="Colour" />
          </Field>
        </CardContent>
      </Card>

      {category !== "accessories" ? (
        <Card>
          <CardHeader>
            <CardTitle>Specification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Spec summary" className="sm:col-span-2">
              <Input
                defaultValue={residential?.spec}
                placeholder="e.g. 7.4kW · Type 2 tethered · 5m cable"
              />
            </Field>
            <Field label="Connection type">
              <Select defaultValue={residential?.connectionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tethered">Tethered</SelectItem>
                  <SelectItem value="Untethered">Untethered</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cable length (optional)">
              <Input defaultValue={residential?.cableLength} placeholder="e.g. 5m" />
            </Field>
            <Field label="Power output">
              <Input defaultValue={residential?.powerOutput} placeholder="e.g. 7.4kW" />
            </Field>
            <Field label="Price (£, inc. VAT)">
              <Input
                type="number"
                min={0}
                defaultValue={residential?.price}
                placeholder="e.g. 980"
              />
            </Field>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cable options</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Style">
              <Select defaultValue={accessory?.style}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coiled">Coiled</SelectItem>
                  <SelectItem value="Straight">Straight</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phase">
              <Select defaultValue={accessory?.phase}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single Phase">Single Phase</SelectItem>
                  <SelectItem value="3 Phase">3 Phase</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Length options (comma separated)" className="sm:col-span-2">
              <Input
                defaultValue={accessory?.lengthOptions.join(", ")}
                placeholder="e.g. 5m, 10m"
              />
            </Field>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Accessories show &ldquo;Request a quote&rdquo; on the storefront —
              there&apos;s no price field for this category.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tags &amp; notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Tags (comma separated)">
            <Input
              defaultValue={item?.tags.join(", ")}
              placeholder="e.g. Nison recommends, Free UK delivery"
            />
          </Field>
          <Field label="Internal notes (optional)">
            <Textarea rows={3} placeholder="Notes visible only in admin" />
          </Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6">
        <Button type="button" variant="outline" render={<Link href={`/admin/${category}`} />}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
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
