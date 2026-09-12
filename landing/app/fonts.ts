import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

// Boska -- expressive, high-contrast display serif (Fontshare, free
// commercial use). DM Serif Text (the app's real serif) was tried here and
// reverted: it's designed for body text, not big display headlines, and
// looked heavy/blocky at the hero's 88px scale where Boska's higher
// stroke-contrast letterforms hold up. Kept for every serif/display moment;
// DM Sans below still matches the app for body copy.
export const boska = localFont({
  src: [
    { path: "../public/fonts/Boska-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Boska-Italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/Boska-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Boska-MediumItalic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-boska",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

// DM Sans -- the app's body/UI sans (mobile/constants/theme.ts: fonts.sans,
// fonts.sansMedium, fonts.sansSemiBold). This half of the font swap held up
// fine at every size the site uses, so it stays.
export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  // Not preloaded: lets the LCP Boska wordmark win the critical request
  // chain. Body text swaps in cleanly via display:swap + adjustFontFallback
  // (CLS stays 0).
  preload: false,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: true,
});
