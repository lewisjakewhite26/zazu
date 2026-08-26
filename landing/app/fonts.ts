import localFont from "next/font/local";

// Boska — expressive high-contrast display serif (Fontshare, free commercial use)
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

// Satoshi — structurally precise grotesque body sans (Fontshare, free commercial use)
export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Satoshi-Italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  // Not preloaded: lets the LCP Boska wordmark win the critical request chain.
  // Body text swaps in cleanly via display:swap + adjustFontFallback (CLS stays 0).
  preload: false,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
