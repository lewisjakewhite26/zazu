"use client";

import { motion } from "framer-motion";

const steps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ),
    label: "Alarm fires",
    description: "One word appears on screen. Just the word. Nothing else.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
    label: "You get up",
    description: "Etymology, definition, roots. The full story of where the word came from.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.71 3.15 1.5 4.5.76.76 1.23 1.52 1.41 2.5"></path>
      </svg>
    ),
    label: "You remember it",
    description: "Answer one question to dismiss the alarm. The act of answering is what makes it stick.",
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-[var(--color-white)] section-padding">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* Left: heading + intro, sticky on desktop so it stays in view while steps scroll past */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 lg:sticky lg:top-32"
        >
          <h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)] mb-6">
            Your alarm just got smarter, now so can you.
          </h2>
          <p className="text-[var(--color-subtext)] text-lg md:text-[18px] max-w-[440px] leading-relaxed">
            When your alarm fires, one word appears on screen. Just the word. Get up, and you unlock the full story: where it came from, what it means, and which other words share its roots. The whole thing takes under a minute.
          </p>
        </motion.div>

        {/* Right: the three steps, stacked */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              whileHover={{
                backgroundColor: "var(--color-peach)",
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="glass-card rounded-[20px] p-8 flex items-start gap-6 transition-colors duration-300"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-[var(--color-white)] flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="font-sans font-semibold text-[20px] text-[var(--color-ink)] mb-2">
                  {step.label}
                </h3>
                <p className="text-[var(--color-subtext)] text-[16px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
