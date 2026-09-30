// "Return to where you were" after signing in / creating an account. The
// target travels as `?redirect=<path+query+hash>` through sign-in, sign-up,
// Google OAuth and the forgot/reset-password pages.

const AUTH_PATHS = ["/sign-in", "/forgot-password", "/reset-password"];

/**
 * Only same-site relative paths are allowed — `//evil.com` and `/\evil.com`
 * are treated by browsers as other origins, so they're rejected.
 */
export function safeRedirect(target: string | null | undefined, fallback = "/account"): string {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  // Never bounce back onto an auth page (sign-in → sign-in loops).
  if (AUTH_PATHS.some((p) => target === p || target.startsWith(`${p}?`) || target.startsWith(`${p}/`))) {
    return fallback;
  }
  return target;
}

/** Appends `redirect=<target>` to an auth page URL (skipped when there's nowhere useful to return to). */
export function withRedirect(path: string, target: string | null | undefined): string {
  const safe = safeRedirect(target, "");
  if (!safe) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}redirect=${encodeURIComponent(safe)}`;
}

/** `/sign-in?redirect=<current page>` — use for every "Sign in" / "Get Started" link. */
export function signInHref(returnTo?: string | null): string {
  return withRedirect("/sign-in", returnTo);
}
