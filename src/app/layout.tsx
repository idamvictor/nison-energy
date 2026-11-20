import type { Metadata } from "next";
import { SiteLoader } from "@/components/shared/site-loader";
import { AppHydration } from "@/components/shared/app-hydration";
import { ScrollManager } from "@/components/shared/scroll-manager";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { CartSheet } from "@/components/shared/cart-sheet";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { PaymentPreconnect } from "@/components/shared/payment-preconnect";
import { SITE_URL } from "@/lib/site";
import { GA_INIT_SCRIPT, GA_SRC, GTM_SRC } from "@/lib/analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ocunio Energy | EV Charger Supply, Kits & UK Installation",
  description:
    "Shop smart EV chargers, compliant installation kits, and EV cables—or book certified UK installation for your home or workplace. Fast nationwide delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Google tags, server-rendered in the <head> of every page. The init runs first so both start with consent denied. */}
        <script id="google-tag-init" dangerouslySetInnerHTML={{ __html: GA_INIT_SCRIPT }} />
        <script id="google-tag-manager" async src={GTM_SRC} />
        <script id="google-tag" async src={GA_SRC} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <PaymentPreconnect />
        <SiteLoader />
        <AppHydration />
        <ScrollManager />
        <GoogleAnalytics />
        <CookieBanner />
        <CartSheet />
        <WhatsAppButton />
        {children}
      </body>
    </html>
  );
}
