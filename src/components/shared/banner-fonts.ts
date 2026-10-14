import { Kalam, Montserrat, Plus_Jakarta_Sans } from "next/font/google";

// Fonts from the designed banners (solar hero, home hero). Declared once here
// so every banner shares the same loaded font files.
export const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap" });
export const kalam = Kalam({ subsets: ["latin"], weight: "700", display: "swap" });
export const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"], display: "swap" });
