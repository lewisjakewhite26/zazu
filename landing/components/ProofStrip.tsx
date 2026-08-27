"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "1,741", label: "Gold words across ten themed packs" },
  { value: "393", label: "Free daily-alarm words, no subscription needed" },
  { value: "1", label: "Word a day. That's the whole ritual." },
];

export default function ProofStrip() {
  return (
    <section className="w-full bg-[var(--color-white)] px-6 py-16 md:py-20">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            className="flex flex-col items-center"
          >
            <span className="font-serif text-[clamp(44px,6vw,72px)] leading-none text-[var(--color-ink)]">
              {stat.value}
            </span>
            <span className="mt-3 text-[var(--color-subtext)] text-[15px] md:text-[16px] max-w-[220px] leading-snug">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
