"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ),
    label: "Alarm fires",
    description: "One word appears on screen. Just the word. Nothing else.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
    label: "You get up",
    description: "Etymology, definition, roots. The full story of where the word came from.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="max-w-[1100px] mx-auto flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center flex flex-col items-center mb-16"
        >
          <div className="flex flex-col items-center gap-[8px] mb-6">
            <h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)]">
              Your alarm just got smarter,
            </h2>
            <h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)]">
              now so can you.
            </h2>
          </div>
          <p className="text-[var(--color-subtext)] text-lg md:text-[18px] max-w-[600px] leading-relaxed">
            When your alarm fires, one word appears on screen. Just the word. Get up, and you unlock the full story. You learn where it came from, what it means, and which other words share its roots. The whole thing takes under a minute.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
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
              className="glass-card rounded-[20px] p-8 bg-white transition-colors duration-300"
            >
              <div className="mb-6 w-12 h-12 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="font-sans font-semibold text-[20px] text-[var(--color-ink)] mb-3">
                {step.label}
              </h3>
              <p className="text-[var(--color-subtext)] text-[16px] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
