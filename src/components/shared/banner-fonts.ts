import { Kalam, Plus_Jakarta_Sans } from "next/font/google";

// Fonts from the designed banners (solar hero, home promo banner). Declared
// once here so both banners share the same loaded font files.
export const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
export const kalam = Kalam({ subsets: ["latin"], weight: "700", display: "swap" });
