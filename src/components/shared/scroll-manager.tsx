"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll handling, replacing the browser's own restoration:
 * - a normal link click always opens the new page at the very top;
 * - Back/Forward returns to where you were (e.g. the product card you opened),
 *   retrying until the page is tall enough — catalog grids sit behind a
 *   `<Suspense fallback={null}>`, so they briefly render empty on the way back.
 *
 * Variant pickers that swap URL in place call `keepScrollOnNextNav()` first.
 */

const STORAGE_KEY = "ocunio-scroll";
const RESTORE_TIMEOUT_MS = 1500;

let keepNext = false;

/** Stop the next pathname change from jumping to the top (variant switches). */
export function keepScrollOnNextNav() {
  keepNext = true;
}

const urlKey = () => window.location.pathname + window.location.search;

function readAll(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function save(key: string, y: number) {
  try {
    const all = readAll();
    all[key] = Math.round(y);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable (private mode etc.) — restoration just won't happen.
  }
}

export function ScrollManager() {
  const pathname = usePathname();
  /** Saved position to restore after a Back/Forward, captured at popstate time. */
  const popTarget = useRef<number | null>(null);
  /** While restoring, scroll events are the page clamping — don't record them. */
  const restoring = useRef(false);
  const cancelRestore = useRef<() => void>(() => {});
  const firstRun = useRef(true);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    let frame = 0;
    const onScroll = () => {
      if (frame || restoring.current) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!restoring.current) save(urlKey(), window.scrollY);
      });
    };
    const onPop = () => {
      // Same-page history moves (hash links) never re-run the pathname effect.
      if (window.location.pathname === lastPath.current) return;
      // Read before the new page renders and any clamped scroll gets saved.
      popTarget.current = readAll()[urlKey()] ?? 0;
      restoring.current = true;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      history.scrollRestoration = previous;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    cancelRestore.current();
    lastPath.current = pathname;

    let target: number | null = null;
    if (firstRun.current) {
      firstRun.current = false;
      // Hard reload: put the reader back where they were.
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav?.type === "reload" || nav?.type === "back_forward") {
        target = readAll()[urlKey()] ?? null;
      }
    } else if (popTarget.current !== null) {
      target = popTarget.current;
    } else if (keepNext) {
      keepNext = false;
      return;
    } else {
      if (!window.location.hash) window.scrollTo(0, 0);
      return;
    }

    popTarget.current = null;
    if (target === null || target <= 0) {
      if (target === 0) window.scrollTo(0, 0);
      restoring.current = false;
      return;
    }

    const y = target;
    restoring.current = true;
    const started = performance.now();
    let frame = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      restoring.current = false;
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
    cancelRestore.current = stop;
    // The reader taking over ends the restore.
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);

    const tick = () => {
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, maxY));
      if (maxY >= y || performance.now() - started > RESTORE_TIMEOUT_MS) {
        stop();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    tick();

    return stop;
  }, [pathname]);

  return null;
}
