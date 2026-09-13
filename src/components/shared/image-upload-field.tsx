"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, Loader2, Upload } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Drop-in replacement for a plain image-URL <Input>. Offers both the
 * existing "paste a link" flow and uploading a file straight to our bucket
 * (POST /api/media — see src/lib/media/queries.ts for the upload/serve side).
 */
export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
          {value ? (
            <Image src={value} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <Tabs defaultValue="link" className="flex-1">
          <TabsList className="mb-1.5">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="link">
            <Input
              required
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              aria-label={label}
            />
          </TabsContent>
          <TabsContent value="upload">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Upload />
              )}
              {uploading ? "Uploading…" : "Choose image"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
