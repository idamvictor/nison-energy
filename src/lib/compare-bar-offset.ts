"use client";

import { useEffect, type RefObject } from "react";

/**
 * While a (fixed, bottom) compare bar is showing, flag it on <html> and
 * publish its height as `--compare-bar-h`, so other floating UI — the
 * WhatsApp button — can sit just above it instead of underneath.
 */
export function useCompareBarOffset(ref: RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!open || !el) return;

    root.dataset.compareBar = "open";
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty("--compare-bar-h", `${Math.ceil(entry.borderBoxSize[0].blockSize)}px`);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete root.dataset.compareBar;
      root.style.removeProperty("--compare-bar-h");
    };
  }, [ref, open]);
}
