"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, GripVertical, ImageOff, Plus, X } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const originalId = row?.id ?? "";
  const adminBack =
    category === "Residential"
      ? "/admin/residential"
      : category === "Commercial"
        ? "/admin/commercial"
        : "/admin/accessories";
  const storefrontBase =
    category === "Residential"
      ? "/home-charging"
      : category === "Commercial"
        ? "/workplace-charging"
        : "/accessories";

  const isCharger = category !== "Accessory";

  const [slug, setSlug] = useState(row?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [name, setName] = useState(row?.name ?? "");
  // Auto-follows the name (slugified) until the admin edits the slug field
  // directly, at which point it locks to whatever they typed — same pattern
  // used for brand-new products, now applied to edits of existing ones too.
  const currentSlug = slugTouched ? slug : slugify(name);
  const [brand, setBrand] = useState(row?.brand ?? "");
  const [sku, setSku] = useState(row?.sku ?? "");
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
  const [installFee, setInstallFee] = useState(
    row?.installFee != null ? String(row.installFee) : "",
  );
  const [cableLengthOptions, setCableLengthOptions] = useState(
    toCsv(row?.cableLengthOptions ?? []),
  );
  const [octopusPartner, setOctopusPartner] = useState(
    (row?.compatibleTariffs ?? []).includes("Octopus Energy"),
  );
  const [ovoPartner, setOvoPartner] = useState(
    (row?.compatibleTariffs ?? []).includes("OVO Energy"),
  );

  const [style, setStyle] = useState(row?.style ?? "");
  const [phase, setPhase] = useState(row?.phase ?? "");
  const [lengthOptions, setLengthOptions] = useState(
    toCsv(row?.lengthOptions ?? []),
  );

  const [gallery, setGallery] = useState<{ id: string; url: string }[]>(() => {
    const g = row?.gallery ?? [];
    const urls = g.length > 0 ? g : [row?.cardImage ?? ""];
    return urls.map((url) => ({ id: crypto.randomUUID(), url }));
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
  const [saved, setSaved] = useState(false);

  const galleryImages = gallery.map((g) => g.url).filter((s) => s.trim() !== "");

  function buildInput(): ProductInput {
    return {
      category,
      name,
      brand,
      sku: sku.trim() || null,
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
      price: price.trim() !== "" ? Number(price) : null,
      installFee: isCharger && installFee.trim() !== "" ? Number(installFee) : null,
      cableLengthOptions:
        category === "Residential" ? fromCsv(cableLengthOptions) : [],
      compatibleTariffs: [
        ...(octopusPartner ? ["Octopus Energy"] : []),
        ...(ovoPartner ? ["OVO Energy"] : []),
      ],
      style: category === "Accessory" ? style || null : null,
      phase: category === "Accessory" ? phase || null : null,
      lengthOptions: category === "Accessory" ? fromCsv(lengthOptions) : [],
      tagline: null,
      gallery: galleryImages,
      description: fromParas(description),
      features: fromLines(features),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      warranty: warranty.trim() || null,
    };
  }

  const [baseline, setBaseline] = useState(() => JSON.stringify(buildInput()));
  const isDirty =
    isNew || currentSlug !== originalId || JSON.stringify(buildInput()) !== baseline;

  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleGalleryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGallery((prev) => {
      const oldIndex = prev.findIndex((g) => g.id === active.id);
      const newIndex = prev.findIndex((g) => g.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const input = buildInput();
    const finalSlug = currentSlug.trim();

    startTransition(async () => {
      const result = await saveProduct(category, originalId, finalSlug, isNew, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (isNew) {
        router.push(adminBack);
        router.refresh();
        return;
      }
      if (result.id !== originalId) {
        // The slug/id changed — the current URL no longer resolves to this
        // product, so follow it to its new edit URL instead of refreshing
        // in place.
        router.replace(`${adminBack}/${result.id}`);
        return;
      }
      setBaseline(JSON.stringify(input));
      setSaved(true);
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
        <div className="flex items-center gap-4">
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {row && (
            <Link
              href={`${storefrontBase}/${row.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              View on site
              <ExternalLink className="size-4" />
            </Link>
          )}
        </div>
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
            <DndContext
              sensors={dndSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleGalleryDragEnd}
            >
              <SortableContext
                items={gallery.map((g) => g.id)}
                strategy={verticalListSortingStrategy}
              >
                {gallery.map((item, index) => (
                  <SortableGalleryItem
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    index={index}
                    removable={gallery.length > 1}
                    onChange={(url) =>
                      setGallery((prev) =>
                        prev.map((g) => (g.id === item.id ? { ...g, url } : g)),
                      )
                    }
                    onRemove={() =>
                      setGallery((prev) => prev.filter((g) => g.id !== item.id))
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit border-primary/25 text-primary hover:bg-primary/5"
              onClick={() =>
                setGallery((prev) => [...prev, { id: crypto.randomUUID(), url: "" }])
              }
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
              value={currentSlug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="e.g. easee-one"
            />
            {!isNew && currentSlug !== originalId && (
              <p className="text-xs font-normal text-muted-foreground">
                Changing this changes the product&apos;s URL — old links to it
                will stop working.
              </p>
            )}
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
          <Field label="SKU">
            <Input value={sku} onChange={(e) => setSku(e.target.value)} />
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
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={octopusPartner}
                onChange={(e) => setOctopusPartner(e.target.checked)}
              />
              Octopus Energy partner
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={ovoPartner}
                onChange={(e) => setOvoPartner(e.target.checked)}
              />
              OVO Energy partner
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
            <Field label="Installation fee (£)">
              <Input
                type="number"
                min={0}
                value={installFee}
                onChange={(e) => setInstallFee(e.target.value)}
              />
            </Field>
            {category === "Residential" && (
              <Field label="Cable length options (comma separated)">
                <Input
                  value={cableLengthOptions}
                  onChange={(e) => setCableLengthOptions(e.target.value)}
                  placeholder="5m, 7.5m, 10m"
                />
              </Field>
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
            <Field label="Price (£, inc. VAT)">
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detail page content</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm supports-backdrop-filter:bg-background/80 sm:-mx-6 sm:px-6">
        {!pending && saved && !isDirty && (
          <p className="text-sm font-medium text-success">Saved</p>
        )}
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link href={adminBack} />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending || !isDirty}>
          {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function SortableGalleryItem({
  id,
  url,
  index,
  removable,
  onChange,
  onRemove,
}: {
  id: string;
  url: string;
  index: number;
  removable: boolean;
  onChange: (url: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-2 ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="mt-2.5 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1">
        <ImageUploadField
          value={url}
          onChange={onChange}
          label={`Gallery image ${index + 1}`}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
        disabled={!removable}
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
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
