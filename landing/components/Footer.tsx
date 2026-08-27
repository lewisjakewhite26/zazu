"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="w-full dawn-gradient pt-20 pb-10 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1200px] mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 mb-16 text-center md:text-left">
          
          {/* Left: Wordmark & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-serif text-[32px] lowercase text-[var(--color-ink)] leading-none mb-2">
              zazu
            </h2>
            <p className="text-[var(--color-ink)] opacity-70 text-[16px] tracking-wide">
              A new word. Every morning.
            </p>
          </div>

          {/* Centre: Links */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
            <Link href="/privacy" className="text-[var(--color-ink)] font-medium hover:opacity-70 transition-opacity">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[var(--color-ink)] font-medium hover:opacity-70 transition-opacity">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-[var(--color-ink)] font-medium hover:opacity-70 transition-opacity">
              Accessibility
            </Link>
            <a href="mailto:hello@zazu.org.uk" className="text-[var(--color-ink)] font-medium hover:opacity-70 transition-opacity">
              Support
            </a>
          </div>

          {/* Right: Download Buttons */}
          <div className="flex flex-col gap-3">
            <a
              href="mailto:hello@zazu.org.uk?subject=Zazu%20Waitlist%20%E2%80%94%20iOS"
              className="h-10 px-6 rounded-full bg-[var(--color-ink)] text-white text-[14px] flex items-center justify-center hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              App Store: Join the Waitlist
            </a>
            <a
              href="mailto:hello@zazu.org.uk?subject=Zazu%20Waitlist%20%E2%80%94%20Android"
              className="h-10 px-6 rounded-full bg-[var(--color-ink)] text-white text-[14px] flex items-center justify-center hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Google Play: Join the Waitlist
            </a>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="border-t border-[var(--color-ink)] border-opacity-10 pt-8 flex justify-center">
          <p className="text-[var(--color-subtext)] text-[13px]">
            © 2026 Lewis White trading as Zazu · hello@zazu.org.uk
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
