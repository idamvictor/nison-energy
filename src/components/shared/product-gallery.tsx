"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";

import { youtubeEmbedUrl, youtubeId, youtubeThumbnail } from "@/lib/media/video";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  thumbnailImage,
  onSelectThumbnail,
}: {
  /** Image URLs — a YouTube link in the list is shown as a playable video. */
  images: string[];
  name: string;
  /** Admin-only: the image currently used as the card/thumbnail image. */
  thumbnailImage?: string;
  /** Admin-only: lets each swatch be picked as the card/thumbnail image. */
  onSelectThumbnail?: (image: string) => void;
}) {
  const [active, setActive] = useState(0);
  // The video only loads YouTube's player once the visitor presses play.
  const [playing, setPlaying] = useState(false);
  const show = (index: number) => {
    setActive(index);
    setPlaying(false);
  };

  const activeVideo = youtubeId(images[active] ?? "");

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-border">
        {activeVideo ? (
          playing ? (
            <iframe
              key={activeVideo}
              src={youtubeEmbedUrl(activeVideo)}
              title={`${name} — video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 size-full bg-black"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play video: ${name}`}
              className="absolute inset-0 flex items-center justify-center bg-black"
            >
              <Image
                src={youtubeThumbnail(activeVideo)}
                alt=""
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-contain opacity-90"
              />
              <span className="relative flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-1 size-7 fill-current" />
              </span>
            </button>
          )
        ) : (
          <Image
            key={images[active]}
            src={images[active]}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain p-10"
          />
        )}

        {images.length > 1 && !playing && (
          <>
            <button
              type="button"
              onClick={() => show((active - 1 + images.length) % images.length)}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100 hover:bg-secondary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => show((active + 1) % images.length)}
              aria-label="Next image"
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:opacity-100 hover:bg-secondary"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute right-3 bottom-3 rounded-full bg-foreground/70 px-2 py-0.5 text-xs text-white">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const video = youtubeId(image);
            return (
              <div key={image} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => show(index)}
                  aria-label={video ? `Show video` : `Show image ${index + 1}`}
                  className={cn(
                    "relative size-16 overflow-hidden rounded-lg bg-white ring-1 transition-all",
                    index === active
                      ? "ring-2 ring-primary"
                      : "ring-border hover:ring-primary/40"
                  )}
                >
                  <Image
                    src={video ? youtubeThumbnail(video) : image}
                    alt=""
                    fill
                    sizes="64px"
                    className={video ? "object-cover" : "object-contain p-1.5"}
                  />
                  {video && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Play className="ml-0.5 size-3.5 fill-current" />
                      </span>
                    </span>
                  )}
                </button>
                {/* A video can't be the card image. */}
                {onSelectThumbnail && !video && (
                  <button
                    type="button"
                    onClick={() => onSelectThumbnail(image)}
                    aria-label={
                      image === thumbnailImage
                        ? "Current thumbnail image"
                        : "Set as thumbnail image"
                    }
                    title={
                      image === thumbnailImage
                        ? "Current thumbnail image"
                        : "Set as thumbnail image"
                    }
                    className={cn(
                      "absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-background transition-colors",
                      image === thumbnailImage
                        ? "bg-foreground text-background"
                        : "bg-white text-muted-foreground hover:text-primary-ink"
                    )}
                  >
                    <Star
                      className={cn(
                        "size-3",
                        image === thumbnailImage && "fill-current"
                      )}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
