"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What if I wake up before I've answered the question?",
    answer: "The alarm keeps sounding until you answer it. There's no snooze that skips the word: you can hold to snooze if you need a few more minutes, but the word is waiting for you either way.",
  },
  {
    question: "Does it work with silent mode or Do Not Disturb?",
    answer: "The alarm uses your phone's dedicated alarm channel, the same one your regular alarm clock uses, so it sounds even when your phone is on silent or Do Not Disturb.",
  },
  {
    question: "What if I get the word wrong?",
    answer: "You get another go. Getting it wrong doesn't lock you out or restart the alarm, it just asks you to try again.",
  },
  {
    question: "Do I need an account?",
    answer: "No. You can use the daily alarm and today's word as a guest, with no sign-up. Signing in with Apple or Google just lets your streak and progress sync across devices.",
  },
  {
    question: "What happens to my data if I delete my account?",
    answer: "It's removed permanently. See our Privacy Policy for the full detail on what we collect and how to request deletion.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-subtext)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="shrink-0"
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full bg-[var(--color-white)] section-padding">
      <div className="max-w-[760px] mx-auto flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(36px,4.5vw,56px)] leading-tight text-[var(--color-ink)] mb-12 text-center"
        >
          Questions before you start.
        </motion.h2>

        <div className="w-full flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass-card rounded-[18px] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="font-sans font-medium text-[16px] md:text-[17px] text-[var(--color-ink)]">
                    {faq.question}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-[var(--color-subtext)] text-[15px] md:text-[16px] leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
