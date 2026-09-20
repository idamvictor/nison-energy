import type { Metadata } from "next";
import { SiteLoader } from "@/components/shared/site-loader";
import { AppHydration } from "@/components/shared/app-hydration";
import { CartSheet } from "@/components/shared/cart-sheet";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ocunio Energy | Premium EV Home Charging",
  description:
    "Certified EV charger installation for home and workplace. Instant online quotes, expert installers, and OZEV grant support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteLoader />
        <AppHydration />
        <CartSheet />
        {children}
      </body>
    </html>
  );
}
