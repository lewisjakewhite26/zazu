"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const wordData = {
  word: "PANDEMONIUM",
  author: "John Milton",
  work: "Paradise Lost",
  year: "1667",
  meaning: "A place of wild chaos and noise — originally the capital of Hell.",
  roots: [
    {
      fragment: "PAN",
      language: "Greek",
      root: "pan",
      meaning: "all / every",
      position: "left"
    },
    {
      fragment: "DEMON",
      language: "Greek", 
      root: "daimon",
      meaning: "spirit / divine power",
      position: "centre"
    },
    {
      fragment: "IUM",
      language: "Latin",
      root: "-ium",
      meaning: "place of",
      position: "right"
    }
  ]
};

export default function EtymologyExploder() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Section heading fade out (0 to 0.1)
  const headingOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Overall section fade (fades in 0-0.1, fades out 0.9-1.0)
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // Translations (reduced distance to prevent pushing off-screen)
  const panXVal = isMobile ? "-8vw" : "-15vw";
  const iumXVal = isMobile ? "8vw" : "15vw";

  const panX = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 0.95], ["0vw", panXVal, panXVal, "0vw"]);
  const panY = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 0.95], ["0vh", "-8vh", "-8vh", "0vh"]);
  
  const demonY = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 0.95], ["0vh", "-6vh", "-6vh", "0vh"]);

  const iumX = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 0.95], ["0vw", iumXVal, iumXVal, "0vw"]);
  const iumY = useTransform(scrollYProgress, [0.15, 0.4, 0.8, 0.95], ["0vh", "-8vh", "-8vh", "0vh"]);

  // Line progress (grows 0.15-0.4, holds 0.4-0.65, retracts 0.65-0.75)
  const lineProgress = useTransform(scrollYProgress, [0.15, 0.4, 0.65, 0.75], [0, 1, 1, 0]);

  // Labels fade in (staggered 0.4 - 0.55), hold until 0.65, fade out by 0.75
  const label1Opacity = useTransform(scrollYProgress, [0.4, 0.45, 0.65, 0.75], [0, 1, 1, 0]);
  const label2Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.65, 0.75], [0, 1, 1, 0]);
  const label3Opacity = useTransform(scrollYProgress, [0.5, 0.55, 0.65, 0.75], [0, 1, 1, 0]);

  // Attribution fade in AFTER roots disappear (0.75 - 0.85), hold, then self-fade by the end
  // (self-contained so it can be anchored to the stage bottom rather than the fading content container)
  const attributionOpacity = useTransform(scrollYProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 0]);

  // Static values for reduced motion
  const staticState = prefersReducedMotion;

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-transparent">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden dawn-gradient flex flex-col items-center justify-center">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.h2 
            style={{ opacity: staticState ? 0 : headingOpacity }}
            className="font-serif text-[18px] text-[var(--color-subtext)]"
          >
            Every word has a story.
          </motion.h2>
        </motion.div>

        {/* Main Content Container */}
        <motion.div 
          style={{ opacity: staticState ? 1 : sectionOpacity }}
          className="relative flex flex-row items-center justify-center z-10"
        >
          {/* PAN Fragment */}
          <motion.div 
            style={{ 
              x: staticState ? panXVal : panX, 
              y: staticState ? "-8vh" : panY 
            }} 
            className="relative flex flex-col items-center"
          >
            <span className="font-serif text-[clamp(28px,5.5vw,72px)] text-[var(--color-ink)] leading-none">
              PAN
            </span>
            
            <div className="absolute top-full flex flex-col items-center w-[200px] mt-4">
              <div className="relative w-[1px] h-[10vh] mb-4 flex justify-center">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <motion.line 
                    x1="0" y1="0" x2="0" y2="100%" 
                    stroke="var(--color-ink)" 
                    strokeWidth="1" 
                    strokeOpacity="0.15" 
                    style={{ pathLength: staticState ? 1 : lineProgress }} 
                  />
                </svg>
              </div>

              <motion.div 
                style={{ opacity: staticState ? 1 : label1Opacity }}
                className="flex flex-col items-center text-center gap-1"
              >
                <span className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-subtext)]">
                  {wordData.roots[0].language}
                </span>
                <span className="font-serif italic text-[24px] text-[var(--color-ink)]">
                  {wordData.roots[0].root}
                </span>
                <span className="font-sans text-[14px] text-[var(--color-subtext)]">
                  {wordData.roots[0].meaning}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* DEMON Fragment */}
          <motion.div 
            style={{ 
              y: staticState ? "-6vh" : demonY 
            }} 
            className="relative flex flex-col items-center"
          >
            <span className="font-serif text-[clamp(28px,5.5vw,72px)] text-[var(--color-ink)] leading-none">
              DEMON
            </span>
            
            <div className="absolute top-full flex flex-col items-center w-[200px] mt-4">
              <div className="relative w-[1px] h-[10vh] mb-4 flex justify-center">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <motion.line 
                    x1="0" y1="0" x2="0" y2="100%" 
                    stroke="var(--color-ink)" 
                    strokeWidth="1" 
                    strokeOpacity="0.15" 
                    style={{ pathLength: staticState ? 1 : lineProgress }} 
                  />
                </svg>
              </div>

              <motion.div 
                style={{ opacity: staticState ? 1 : label2Opacity }}
                className="flex flex-col items-center text-center gap-1"
              >
                <span className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-subtext)]">
                  {wordData.roots[1].language}
                </span>
                <span className="font-serif italic text-[24px] text-[var(--color-ink)]">
                  {wordData.roots[1].root}
                </span>
                <span className="font-sans text-[14px] text-[var(--color-subtext)]">
                  {wordData.roots[1].meaning}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* IUM Fragment */}
          <motion.div 
            style={{ 
              x: staticState ? iumXVal : iumX, 
              y: staticState ? "-8vh" : iumY 
            }} 
            className="relative flex flex-col items-center"
          >
            <span className="font-serif text-[clamp(28px,5.5vw,72px)] text-[var(--color-ink)] leading-none">
              IUM
            </span>
            
            <div className="absolute top-full flex flex-col items-center w-[200px] mt-4">
              <div className="relative w-[1px] h-[10vh] mb-4 flex justify-center">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <motion.line 
                    x1="0" y1="0" x2="0" y2="100%" 
                    stroke="var(--color-ink)" 
                    strokeWidth="1" 
                    strokeOpacity="0.15" 
                    style={{ pathLength: staticState ? 1 : lineProgress }} 
                  />
                </svg>
              </div>

              <motion.div 
                style={{ opacity: staticState ? 1 : label3Opacity }}
                className="flex flex-col items-center text-center gap-1"
              >
                <span className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-subtext)]">
                  {wordData.roots[2].language}
                </span>
                <span className="font-serif italic text-[24px] text-[var(--color-ink)]">
                  {wordData.roots[2].root}
                </span>
                <span className="font-sans text-[14px] text-[var(--color-subtext)]">
                  {wordData.roots[2].meaning}
                </span>
              </motion.div>
            </div>
          </motion.div>

        </motion.div>

        {/* Attribution Pill & Meaning - anchored to the stage bottom (prevents short-viewport clipping) */}
        <motion.div 
          style={{ opacity: staticState ? 1 : attributionOpacity }}
          className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 flex flex-col items-center text-center px-4 z-20 w-[100vw] max-w-[600px] pointer-events-none"
        >
          <div className="flex items-center justify-center gap-6 mb-8 w-full">
            <div className="h-[1px] flex-1 max-w-[40px] bg-[var(--color-ink)] opacity-10"></div>
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtext)] flex items-center gap-3">
              <span>Coined by <span className="text-[var(--color-ink)] font-semibold">{wordData.author}</span></span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)] opacity-60"></span>
              <span className="font-serif italic text-[13px] text-[var(--color-ink)] tracking-normal">{wordData.work}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)] opacity-60"></span>
              <span>{wordData.year}</span>
            </div>
            <div className="h-[1px] flex-1 max-w-[40px] bg-[var(--color-ink)] opacity-10"></div>
          </div>
          <p className="font-serif italic text-[20px] text-[var(--color-subtext)] leading-relaxed">
            {wordData.meaning}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
