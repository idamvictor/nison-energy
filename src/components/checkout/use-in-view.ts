"use client";

import { useEffect, useState } from "react";

/**
 * `[ref, inView]` — inView turns true once the element has come within
 * ~200px of the viewport, and stays true. Used to open a Stripe session only
 * when its buttons are about to be seen. `ref` is a callback ref, so it also
 * works for elements that mount later (e.g. after the cart loads).
 */
export function useInView<T extends Element>(): [(el: T | null) => void, boolean] {
  const [el, setEl] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, inView]);
  return [setEl, inView];
}
