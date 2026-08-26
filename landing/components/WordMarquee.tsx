"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import RevealCard, { WordData } from "./RevealCard";

const rowOneWords: WordData[] = [
  { word: "Mellifluous", definition: "Sweet or musical; pleasant to hear.", etymology: "From Latin 'mel' (honey) and 'fluere' (to flow).", coined: "15th Century" },
  { word: "Ephemeral", definition: "Lasting for a very short time.", etymology: "From Greek 'ephēmeros', meaning lasting only one day.", coined: "Late 16th Century" },
  { word: "Perspicacious", definition: "Having a ready insight into and understanding of things.", etymology: "From Latin 'perspicax', meaning seeing clearly.", coined: "Early 17th Century" },
  { word: "Sanguine", definition: "Optimistic or positive, especially in a bad situation.", etymology: "From Latin 'sanguis' (blood).", coined: "Middle English" },
  { word: "Laconic", definition: "Using very few words.", etymology: "From 'Lakōnikos', meaning Spartan.", coined: "Late 16th Century" },
  { word: "Ebullient", definition: "Cheerful and full of energy.", etymology: "From Latin 'ebullire', meaning to boil over.", coined: "Late 16th Century" }
];

const rowTwoWords: WordData[] = [
  { word: "Tenacious", definition: "Tending to keep a firm hold of something.", etymology: "From Latin 'tenere', meaning to hold.", coined: "Early 17th Century" },
  { word: "Equanimity", definition: "Mental calmness and composure.", etymology: "From Latin 'aequus' (equal) and 'animus' (mind).", coined: "Early 17th Century" },
  { word: "Truculent", definition: "Eager or quick to argue or fight.", etymology: "From Latin 'trux', meaning fierce.", coined: "Early 16th Century" },
  { word: "Insouciant", definition: "Showing a casual lack of concern.", etymology: "From French 'in-' (not) and 'soucier' (to care).", coined: "Late 18th Century" },
  { word: "Susurrus", definition: "A whispering, murmuring, or rustling sound.", etymology: "From Latin 'susurrare', meaning to hum or whisper.", coined: "Late 19th Century" },
  { word: "Cacophony", definition: "A harsh, discordant mixture of sounds.", etymology: "From Greek 'kakos' (bad) and 'phone' (sound).", coined: "Mid 17th Century" }
];

// Double the arrays to ensure seamless looping (using 4x for safety on ultrawides)
const marqueeTop = [...rowOneWords, ...rowOneWords, ...rowOneWords, ...rowOneWords];
const marqueeBottom = [...rowTwoWords, ...rowTwoWords, ...rowTwoWords, ...rowTwoWords];

export default function WordMarquee() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full dawn-gradient section-padding overflow-hidden flex flex-col items-center py-32">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 text-center max-w-[800px] mb-24 flex flex-col items-center"
      >
        <h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)] mb-6">
          479 free words. Start expanding your vocabulary today.
        </h2>
        <p className="text-[var(--color-ink)] opacity-80 text-lg md:text-[18px] max-w-[650px] leading-relaxed">
          A word a day builds faster than you'd think. Every word in Zazu comes with its full story: etymology, roots, and a morning task that makes it stick.
        </p>
      </motion.div>

      <div 
        className="w-full flex flex-col gap-12 transform -rotate-2"
      >
        {/* Top Row - Scrolls Left */}
        <div className="relative w-full flex overflow-hidden whitespace-nowrap">
          <div 
            className="animate-marquee-left flex flex-nowrap items-start gap-16 whitespace-nowrap"
            style={{ animationPlayState: isHovered ? 'paused' : undefined, animationDuration: '35s' }}
          >
            {marqueeTop.map((wordObj, i) => (
              <RevealCard key={`top-${i}`} wordData={wordObj} onHoverChange={setIsHovered} />
            ))}
          </div>
        </div>

        {/* Bottom Row - Scrolls Right */}
        <div className="relative w-full flex overflow-hidden whitespace-nowrap">
          <div 
            className="animate-marquee-right flex flex-nowrap items-start gap-16 whitespace-nowrap" 
            style={{ animationDirection: 'reverse', animationPlayState: isHovered ? 'paused' : undefined, animationDuration: '45s' }}
          >
            {marqueeBottom.map((wordObj, i) => (
              <RevealCard key={`bottom-${i}`} wordData={wordObj} onHoverChange={setIsHovered} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
