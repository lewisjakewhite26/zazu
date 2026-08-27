"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WordData {
  word: string;
  definition: string;
  etymology: string;
  coined: string;
}

interface RevealCardProps {
  wordData: WordData;
  onHoverChange?: (hovered: boolean) => void;
}

export default function RevealCard({ wordData, onHoverChange }: RevealCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const handleTouch = () => {
    const nextState = !isHovered;
    setIsHovered(nextState);
    onHoverChange?.(nextState);
  };

  return (
    <div className="shrink-0" style={{ width: 380 }}>
      <div
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onTouchStart={handleTouch}
        className="flex flex-col cursor-pointer w-max"
      >
        {/* Naked Typographic Word — decorative, not a document heading (keeps the outline clean) */}
      <div
        className="font-serif text-[40px] md:text-[56px] m-0 leading-normal pb-4 transition-colors duration-300"
        style={{ color: isHovered ? "var(--color-ink)" : "var(--word-idle)" }} // Dim slightly when not hovered (AA-safe floor)
      >
        {wordData.word}
      </div>

      {/* Typographic Explosion Content */}
      <AnimatePresence initial={false}>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              height: { type: "spring", stiffness: 320, damping: 32 },
              opacity: { duration: 0.25, ease: "easeOut" }
            }}
            className="flex flex-col overflow-hidden whitespace-normal"
          >
            <div className="pt-1 flex flex-col gap-1 pb-2">
              <p className="font-serif italic text-[14px] text-[var(--color-ink)] leading-tight">
                {wordData.etymology}
              </p>
              <p className="font-sans text-[13px] text-[var(--color-subtext)] leading-tight">
                {wordData.definition}
              </p>
              <div className="flex justify-start pt-1">
                <span className="inline-flex text-[var(--color-gold)] text-[10px] uppercase tracking-widest font-sans font-bold">
                  {wordData.coined}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
