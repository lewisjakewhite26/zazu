"use client";

import { motion } from "framer-motion";

export default function MidPageCTA() {
  return (
    <section className="w-full bg-[var(--color-white)] px-6 py-16 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <p className="font-serif text-[24px] md:text-[28px] text-[var(--color-ink)]">
          Still reading? Good sign.
        </p>
        <a
          href="mailto:hello@zazu.org.uk?subject=Zazu%20Early%20Access%20Waitlist"
          className="px-8 py-4 bg-ink text-white rounded-full font-medium hover:bg-ink/90 transition-colors inline-flex items-center justify-center whitespace-nowrap"
        >
          Join the Waitlist
        </a>
      </motion.div>
    </section>
  );
}
