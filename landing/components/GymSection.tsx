"use client";

import { motion } from "framer-motion";

const rounds = [
  {
    number: "Round 1",
    name: "Etymology",
    description: "Match word roots to their meanings. Follow a word back through Latin, Greek, or Old English and understand why it means what it means.",
  },
  {
    number: "Round 2",
    name: "Quote Completion",
    description: "Complete a real quote from the source text. For literary pack words that means Shakespeare, Milton, or Tolkien. You read real lines from the actual works.",
  },
  {
    number: "Round 3",
    name: "Contextual Definition",
    description: "Read a passage and work out what the word means from context alone. No definition given. The hardest round.",
  },
];

// Escalating node treatment, all within the dawn palette: peach → blush → lavender
const nodeStyles = [
  "bg-[var(--color-peach)] text-[var(--color-ink)]",
  "bg-[var(--color-blush)] text-[var(--color-ink)]",
  "bg-[var(--color-lavender)] text-[var(--color-ink)] shadow-[0_8px_24px_rgba(200,180,232,0.45)]",
];

export default function GymSection() {
  return (
    <section className="w-full bg-[var(--color-white)] section-padding overflow-hidden">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center flex flex-col items-center mb-16"
        >
          <h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)] mb-6">
            Go deeper with Word Gym.
          </h2>
          <p className="text-[var(--color-subtext)] text-lg md:text-[18px] max-w-[700px] leading-relaxed">
            Every word has three gym rounds. Match roots to meanings, complete real literary quotes, deduce definitions from context. Optional, but addictive.
          </p>
        </motion.div>

        <div className="relative w-full max-w-[820px]">
          {/* Progression spine — draws downward, escalating peach → ink */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-[23px] top-6 bottom-6 w-[2px] origin-top bg-gradient-to-b from-[var(--color-peach)] via-[var(--color-blush)] to-[var(--color-lavender)]"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-6">
            {rounds.map((round, i) => {
              const isHardest = i === rounds.length - 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Round node — sits on the spine */}
                  <div className={`relative z-10 shrink-0 h-12 w-12 rounded-full flex items-center justify-center font-serif text-[22px] leading-none ${nodeStyles[i]}`}>
                    {i + 1}
                  </div>

                  {/* Round card */}
                  <div className={`glass-card ${isHardest ? "glass-card--raised" : ""} rounded-[20px] p-7 md:p-8 bg-white flex-1`}>
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="font-sans text-[12px] uppercase tracking-[0.18em] text-[var(--color-subtext)]">
                        {round.number}
                        {isHardest && (
                          <span className="ml-3 text-[var(--color-gold)] font-bold">· Hardest</span>
                        )}
                      </span>
                      {/* Difficulty meter — fills as the rounds escalate */}
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className={`h-1.5 w-5 rounded-full bg-[var(--color-ink)] ${d <= i ? "opacity-100" : "opacity-10"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-serif text-[26px] md:text-[28px] text-[var(--color-ink)] mb-2">
                      {round.name}
                    </h3>
                    <p className="text-[var(--color-subtext)] text-[16px] md:text-[18px] leading-relaxed">
                      {round.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
