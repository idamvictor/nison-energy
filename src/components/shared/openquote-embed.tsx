"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const OPENQUOTE_ORIGIN = "https://app.openquote.net";

type OpenQuoteMessage =
  | { type: "OPENQUOTE_READY" }
  | { type: "OPENQUOTE_HEIGHT_CHANGE"; data: { height: number } }
  | { type: "OPENQUOTE_SCROLL_TO_TOP" }
  | { type: "OPENQUOTE_JOURNEY_COMPLETE" };

// Implements OpenQuote's iframe embed guide: postMessage-driven auto-resize,
// scroll-to-top on question progression, and a completion callback — scoped
// to messages actually from the OpenQuote origin/iframe rather than any
// postMessage the window happens to receive.
export function OpenQuoteEmbed({
  src,
  onComplete,
}: {
  src: string;
  onComplete?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent<OpenQuoteMessage>) {
      if (event.origin !== OPENQUOTE_ORIGIN) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      switch (event.data?.type) {
        case "OPENQUOTE_READY":
          setReady(true);
          break;
        case "OPENQUOTE_HEIGHT_CHANGE":
          setHeight(event.data.data.height);
          break;
        case "OPENQUOTE_SCROLL_TO_TOP":
          wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        case "OPENQUOTE_JOURNEY_COMPLETE":
          onComplete?.();
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onComplete]);

  return (
    <div ref={wrapperRef} className="relative">
      {!ready && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background"
          style={{ minHeight: 400 }}
        >
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        id="openquote-iframe"
        src={src}
        allow="geolocation"
        style={{ width: "100%", border: "none", minHeight: 400, height }}
        className={ready ? "opacity-100" : "opacity-0"}
      />
    </div>
  );
}
