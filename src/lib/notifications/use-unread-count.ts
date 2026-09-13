"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Live unread-notification count for the site header. Refetches on mount, on
 * navigation, and whenever a `"notifications:refresh"` window event fires (the
 * inbox dispatches it after marking things read).
 */
export function useUnreadCount(): number {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      setCount(typeof data.count === "number" ? data.count : 0);
    } catch {
      // ignore — a stale badge is fine
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("notifications:refresh", handler);
    return () => window.removeEventListener("notifications:refresh", handler);
  }, [refresh]);

  return count;
}
