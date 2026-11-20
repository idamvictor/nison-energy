// Google Analytics (GA4 Google tag) + the visitor's cookie choice. Client-safe.
//
// Analytics cookies need consent under UK GDPR / PECR, so the tag loads with
// Google Consent Mode "denied" and only starts storing cookies after the
// visitor accepts in the cookie banner (components/shared/cookie-banner.tsx).

export const GA_ID = "G-DSWERFJQRR";

const STORAGE_KEY = "ocunio-cookie-consent";
const CHANGE_EVENT = "ocunio:cookie-consent";
/** Ask the banner to show again (footer "Cookie settings"). */
export const OPEN_EVENT = "ocunio:cookie-settings";

export type CookieChoice = "granted" | "denied";

export function readCookieChoice(): CookieChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

type Gtag = (...args: unknown[]) => void;

export function saveCookieChoice(choice: CookieChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage blocked (private mode) — the choice applies to this page view only.
  }
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("consent", "update", { analytics_storage: choice });
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeCookieChoice(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * The Google tag snippet exactly as Google Analytics supplies it, with one
 * line added before gtag('js'): Consent Mode defaults (analytics off until
 * the visitor accepts; a returning visitor's earlier choice is applied).
 */
export const GA_INIT_SCRIPT = `
  window['ga-disable-${GA_ID}'] = location.pathname.indexOf('/admin') === 0;
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: (function () { try { return localStorage.getItem('${STORAGE_KEY}') === 'granted' ? 'granted' : 'denied'; } catch (e) { return 'denied'; } })(),
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  gtag('js', new Date());
`;

export const GA_SRC = `https://www.googletagmanager.com/gtm.js?id=${GA_ID}`;

/**
 * Google Tag Manager container (advanced tracking, managed in Tag Manager).
 * Loads alongside the GA tag above and shares GA_INIT_SCRIPT, so it starts
 * with the same consent defaults.
 */
export const GTM_ID = "GTM-MV6KDZD4";
export const GTM_SRC = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
