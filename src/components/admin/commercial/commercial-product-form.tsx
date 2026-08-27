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
import { commercialProductDetails } from "@/lib/commercial-product-details";
import type { CommercialProduct } from "@/lib/commercial-products";

export function CommercialProductForm({ product }: { product?: CommercialProduct }) {
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState<string[]>(() => {
    if (!product) return [""];
    const gallery = commercialProductDetails[product.id]?.gallery;
    return gallery && gallery.length > 0 ? gallery : [product.image];
  });

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
          href="/admin/commercial"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to commercial chargers
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
            <ProductGallery images={nonEmptyImages} name={product?.name ?? "Product preview"} />
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
            <Input required defaultValue={product?.name} placeholder="Product name" />
          </Field>
          <Field label="Brand">
            <Input required defaultValue={product?.brand} placeholder="Brand" />
          </Field>
          <Field label="Category">
            <Input disabled defaultValue="Commercial Chargers" />
          </Field>
          <Field label="Colour">
            <Input defaultValue={product?.colour} placeholder="Colour" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Spec summary" className="sm:col-span-2">
            <Input
              defaultValue={product?.spec}
              placeholder="e.g. 1.4–22kW · Type 2 socket · Untethered"
            />
          </Field>
          <Field label="Connection type">
            <Select defaultValue={product?.connectionType}>
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
            <Input defaultValue={product?.cableLength} placeholder="e.g. 10m" />
          </Field>
          <Field label="Power output">
            <Input defaultValue={product?.powerOutput} placeholder="e.g. 22kW" />
          </Field>
          <Field label="Price (£, inc. VAT)">
            <Input
              type="number"
              min={0}
              defaultValue={product?.price}
              placeholder="e.g. 1634"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags &amp; notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Tags (comma separated)">
            <Input
              defaultValue={product?.tags.join(", ")}
              placeholder="e.g. Ocunio recommends, Dual outlet"
            />
          </Field>
          <Field label="Internal notes (optional)">
            <Textarea rows={3} placeholder="Notes visible only in admin" />
          </Field>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6">
        <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/commercial" />}>
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
