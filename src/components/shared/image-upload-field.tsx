"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, LibraryBig, Play } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaLibraryDialog } from "@/components/shared/media-library-dialog";
import type { MediaScope } from "@/lib/catalog/types";
import { youtubeId, youtubeThumbnail } from "@/lib/media/video";

/**
 * Drop-in replacement for a plain image-URL <Input>. Offers the existing
 * "paste a link" flow plus a "Media Library" picker — browse every image
 * already in use across the catalogue/blog, or upload a new one from this
 * device, all from one popup (see media-library-dialog.tsx).
 */
export function ImageUploadField({
  value,
  onChange,
  label,
  scope,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Which images the Media Library shows (this product section, or "blog"). */
  scope: MediaScope;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  // Gallery rows may hold a YouTube link — preview its still, not a broken image.
  const videoId = value ? youtubeId(value) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
          {value ? (
            <>
              <Image src={videoId ? youtubeThumbnail(videoId) : value} alt="" fill sizes="44px" className="object-cover" />
              {videoId && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="size-3.5 fill-white text-white" />
                </span>
              )}
            </>
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <Tabs defaultValue="link" className="flex-1">
          <TabsList className="mb-1.5">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="library">Media Library</TabsTrigger>
          </TabsList>
          <TabsContent value="link">
            <Input
              required
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://… (image, or a YouTube link in the gallery)"
              aria-label={label}
            />
          </TabsContent>
          <TabsContent value="library">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLibraryOpen(true)}
            >
              <LibraryBig />
              Browse or upload
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      <MediaLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={onChange}
        scope={scope}
      />
    </div>
  );
}
