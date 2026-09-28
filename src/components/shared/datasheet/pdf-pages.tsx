"use client";

// The only module that imports react-pdf / pdf.js. Always load it through
// next/dynamic with `ssr: false` (see datasheet-card.tsx) so pdf.js never
// runs on the server and is only downloaded when a datasheet is on screen.

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileText, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// react-pdf v11 suspends by default, which turns a failed fetch into a thrown
// error that crashes the tree. Opt out so failures land in `onLoadError`.
const SUSPENSE = false;
// Automatic retries before showing the failure state.
const AUTO_RETRIES = 2;

/**
 * Tracks load failures for one PDF. Each retry gets a distinct `?attempt=`
 * URL, because react-pdf caches documents (including failed loads) by URL.
 */
function useRetryingSource(url: string) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const src = attempt === 0 ? url : `${url}?attempt=${attempt}`;

  function onLoadError() {
    if (attempt < AUTO_RETRIES) {
      setAttempt((a) => a + 1);
    } else {
      setFailed(true);
    }
  }
  function retry() {
    setFailed(false);
    setAttempt((a) => a + 1);
  }
  return { src, failed, onLoadError, retry };
}

// Preview image size: the card thumbnail is 256×192 (4:3), rendered at 2x.
const PREVIEW_WIDTH = 512;
const PREVIEW_HEIGHT = 384;

/**
 * Renders the top of page 1 of a local PDF file to a small WebP (PNG where the
 * browser can't encode WebP) — uploaded alongside the datasheet so its card
 * shows instantly without downloading the PDF. Null if rendering fails.
 */
export async function renderPdfPreview(file: File): Promise<Blob | null> {
  try {
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const doc = await task.promise;
      const page = await doc.getPage(1);
      const scale = PREVIEW_WIDTH / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = PREVIEW_WIDTH;
      // Crop to the card's 4:3 shape (top of the page), or the whole page if shorter.
      canvas.height = Math.min(PREVIEW_HEIGHT, Math.ceil(viewport.height));
      await page.render({ canvas, viewport, background: "#ffffff" }).promise;
      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.85),
      );
    } finally {
      void task.destroy();
    }
  } catch {
    return null;
  }
}

function Unavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
      <FileText className="size-8" />
      <p className="text-xs">Preview unavailable</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-1 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCw />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Page 1 at a fixed width — the card thumbnail. */
export function PdfFirstPage({ url, width }: { url: string; width: number }) {
  const { src, failed, onLoadError } = useRetryingSource(url);
  if (failed) return <Unavailable />;

  return (
    <Document
      key={src}
      file={src}
      suspense={SUSPENSE}
      onLoadError={onLoadError}
      loading={<Skeleton className="size-full rounded-none" />}
      error={<Skeleton className="size-full rounded-none" />}
      className="size-full"
    >
      <Page
        pageNumber={1}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        suspense={SUSPENSE}
        loading={<Skeleton className="size-full rounded-none" />}
      />
    </Document>
  );
}

/** Every page, sized to the container's width — the preview dialog body. */
export function PdfAllPages({
  url,
  onPageCount,
}: {
  url: string;
  onPageCount?: (count: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const { src, failed, onLoadError, retry } = useRetryingSource(url);
  // Download progress, tagged with the source it belongs to so a retry starts from 0.
  const [progress, setProgress] = useState<{ src: string; percent: number } | null>(null);
  const percent = progress?.src === src ? progress.percent : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(Math.floor(entry.contentRect.width), 900));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageSkeleton = (
    <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-225 bg-white/10" />
  );
  const loadingState = (
    <div className="relative mx-auto w-full max-w-225">
      {pageSkeleton}
      <div className="absolute inset-x-0 top-24 flex flex-col items-center gap-3 text-sm text-white/70">
        <p>Loading datasheet…{percent !== null && ` ${percent}%`}</p>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/60 transition-[width] duration-300"
            style={{ width: `${percent ?? 5}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full">
      {failed ? (
        <div className="h-64 text-white/70">
          <Unavailable onRetry={retry} />
        </div>
      ) : (
        <Document
          key={src}
          file={src}
          suspense={SUSPENSE}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            onPageCount?.(numPages);
          }}
          onLoadError={onLoadError}
          onLoadProgress={({ loaded, total }) => {
            if (total > 0) {
              setProgress({ src, percent: Math.min(99, Math.round((loaded / total) * 100)) });
            }
          }}
          loading={loadingState}
          error={loadingState}
          className="flex flex-col items-center gap-4"
        >
          {width > 0 &&
            Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                suspense={SUSPENSE}
                className="overflow-hidden rounded-sm bg-white shadow-lg"
                loading={
                  <div className="aspect-[1/1.414] bg-white" style={{ width }} />
                }
              />
            ))}
        </Document>
      )}
    </div>
  );
}
