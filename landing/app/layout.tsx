import type { Metadata, Viewport } from "next";
import { boska, dmSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zazu: A new word every morning",
  description:
    "Zazu is an alarm clock that teaches you one word every morning: its meaning, its story, and one quick question to get you up. Free on Android, with no ads.",
  keywords: "vocabulary, etymology, word of the day, alarm clock, English, learn, morning",
  metadataBase: new URL("https://zazu.org.uk"),
  openGraph: {
    title: "Zazu: A new word every morning",
    description: "An alarm clock that teaches you one word before the day starts.",
    url: "https://zazu.org.uk",
    siteName: "Zazu",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Zazu: A new word every morning" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fde8d8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1225" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${boska.variable} ${dmSans.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
