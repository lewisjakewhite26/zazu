import type { Metadata } from "next";
import CustomCursor from "@/components/CustomCursor";
import { boska, satoshi } from "./fonts";
import { ThemeProvider, themeInitScript } from "@/lib/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Zazu — A new word. Every morning.',
  description: 'Zazu is a vocabulary alarm clock. Learn one curated English word every morning — etymology included. Zazu Gold unlocks 1,700+ premium words across ten themed packs.',
  keywords: 'vocabulary, etymology, word of the day, alarm, English, learn, morning, dictionary',
  openGraph: {
    title: 'Zazu — A new word. Every morning.',
    description: 'Learn one word every morning. Etymology, gym rounds, and ten premium word packs.',
    url: 'https://zazu.org.uk',
    siteName: 'Zazu',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${boska.variable} ${satoshi.variable} h-full antialiased`}
    >
      <head>
        {/* Blocking, before-paint theme init -- avoids a flash of the wrong
            theme while React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <CustomCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
