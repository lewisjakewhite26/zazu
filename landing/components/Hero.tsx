"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const [isSkipped, setIsSkipped] = useState(false);

  // Cinematic timing constants (seconds)
  const introHoldTime = 1.2;
  const introFadeOutTime = 0.8;
  const contentRevealDelay = introHoldTime + 0.4;

  // The Short-Circuit Listener — any sign of intent evaporates the intro
  useEffect(() => {
    const handleSkip = () => setIsSkipped(true);

    window.addEventListener("wheel", handleSkip, { once: true });
    window.addEventListener("touchstart", handleSkip, { once: true });
    window.addEventListener("mousedown", handleSkip, { once: true });
    window.addEventListener("keydown", handleSkip, { once: true });

    return () => {
      window.removeEventListener("wheel", handleSkip);
      window.removeEventListener("touchstart", handleSkip);
      window.removeEventListener("mousedown", handleSkip);
      window.removeEventListener("keydown", handleSkip);
    };
  }, []);

  // Dynamic delays based on skip state
  const activeIntroDelay = isSkipped ? 0 : introHoldTime;
  const activeIntroDuration = isSkipped ? 0.2 : introFadeOutTime; // evaporate instantly if skipped

  const activeContentDelay = isSkipped ? 0 : contentRevealDelay;
  const activeContentDuration = isSkipped ? 0.4 : 0.8; // faster reveal if skipped

  const indicatorDelay = shouldReduceMotion ? 0 : activeContentDelay + 0.3;

  return (
    <section id="main" tabIndex={-1} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden hero-gradient">

      {/* Cinematic Intro Overlay — plays on load, skippable, never gates the CTA */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: activeIntroDuration,
            delay: activeIntroDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute top-0 left-0 w-full h-screen flex items-center justify-center pointer-events-none z-20"
        >
          <span className="font-serif text-[clamp(80px,15vw,200px)] text-ink leading-none lowercase select-none tracking-[-0.035em]">
            zazu
          </span>
        </motion.div>
      )}

      {/* Main Content — two-column: copy left, product right (stacks on mobile) */}
      <motion.div
        initial={{
          opacity: shouldReduceMotion ? 1 : 0,
          y: shouldReduceMotion ? 0 : 20,
        }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: activeContentDuration,
          delay: shouldReduceMotion ? 0 : activeContentDelay,
          ease: "easeOut",
        }}
        className="relative z-10 w-full max-w-[1200px] px-6 py-28 lg:py-0 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-14 lg:gap-16 pointer-events-auto"
      >
        {/* Left: Copy & CTA */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[560px]">
          <h1 className="font-serif text-[clamp(48px,6vw,88px)] text-ink leading-[1.05] m-0 w-full">
            A new word every morning.
          </h1>

          <p className="font-sans text-[clamp(16px,1.8vw,20px)] text-[var(--color-subtext)] mt-5">
            Wake up. Learn something.
          </p>

          <div className="flex flex-col sm:flex-row gap-[12px] mt-10 w-full sm:w-auto justify-center lg:justify-start">
            <a
              href="mailto:hello@zazu.org.uk?subject=Zazu%20Waitlist%20%E2%80%94%20iOS"
              className="px-8 py-4 bg-ink text-white rounded-full font-medium hover:bg-ink/90 transition-colors inline-flex items-center justify-center whitespace-nowrap"
            >
              Join the iOS Waitlist
            </a>
            <a
              href="mailto:hello@zazu.org.uk?subject=Zazu%20Waitlist%20%E2%80%94%20Android"
              className="px-8 py-4 bg-transparent border border-ink text-ink rounded-full font-medium hover:bg-ink/5 transition-colors inline-flex items-center justify-center whitespace-nowrap"
            >
              Join the Android Waitlist
            </a>
          </div>

          <p className="text-sm text-ink/50 mt-4 font-sans">
            Be first in line. Early access invites are sent in batches.
          </p>
        </div>

        {/* Right: Phone Mockup */}
        <motion.div
          className="shrink-0 w-[230px] sm:w-[270px]"
          initial={shouldReduceMotion ? false : { x: 40 }}
          animate={shouldReduceMotion ? undefined : { x: 0, y: [0, -12, 0] }}
          transition={{
            x: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: activeContentDelay + 0.15 },
            y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: activeContentDelay + 0.95 },
          }}
        >
          <div className="relative rounded-[2.6rem] bg-ink p-2.5 shadow-[0_30px_80px_rgba(44,31,46,0.35)]">
            {/* Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-[22px] w-[110px] bg-ink rounded-b-2xl z-10" />
            {/* Screen */}
            <div className="overflow-hidden rounded-[2.1rem] bg-white">
              <Image
                src={theme === "dark" ? "/zazu-word-screen-dark.png" : "/zazu-word-screen.png"}
                alt="The Zazu app's word screen, shown in its real light or dark theme, with a word's definition and etymology"
                width={601}
                height={1302}
                priority
                className="w-full h-auto block"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — appears once the content has settled */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: indicatorDelay, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </motion.div>

    </section>
  );
}
