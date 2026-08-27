"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const packs = [
  { name: "The Literary Pack", words: 270, description: "Words coined or popularised by the authors who shaped English. Shakespeare, Milton, Tolkien, Orwell, Carroll, Chaucer, Dickens and more. Every word comes with a real quote from the source text.", examples: ["Pandemonium", "Eucatastrophe", "Bedazzle"], accent: "lavender" },
  { name: "The Loan Words Pack", words: 390, description: "English borrowed words from every language it encountered. These are 390 of them, organised into thirteen groups.", examples: ["Schadenfreude", "Saudade", "Juggernaut"], accent: "peach" },
  { name: "The Mythology Pack", words: 150, description: "Words that started as gods, monsters, and stories. Greek, Roman, Norse, Egyptian and Celtic mythology all left their mark on everyday English.", examples: ["Narcissism", "Pandora", "Valhalla"], accent: "blush" },
  { name: "The Science Pack", words: 150, description: "Words coined by scientists or born from the moment of discovery. From the naming of elements to the invention of computing vocabulary.", examples: ["Entropy", "Symbiosis", "Quantum"], accent: "lavender" },
  { name: "The Eponym Pack", words: 150, description: "Words that came from real people. Some famous, some entirely forgotten. All of them left a word behind.", examples: ["Kafkaesque", "Machiavellian", "Bowdlerise"], accent: "peach" },
  { name: "The Geography Pack", words: 150, description: "The vocabulary of the physical world. Landforms, waters, climate, and the terms geographers use to describe what they see.", examples: ["Fjord", "Savanna", "Archipelago"], accent: "blush" },
  { name: "The Architecture Pack", words: 150, description: "From Gothic cathedrals to Brutalist housing blocks. The words that describe how buildings are made and what they mean.", examples: ["Cantilever", "Clerestory", "Rotunda"], accent: "lavender" },
  { name: "The Law Pack", words: 150, description: "Legal English and Latin. The terms that courts, contracts, and constitutions depend on. You learn where they actually came from.", examples: ["Habeas corpus", "Prima facie", "Tort"], accent: "peach" },
  { name: "The Music Pack", words: 150, description: "The full vocabulary of musical life. Classical notation, jazz improvisation, folk tradition, and the stage.", examples: ["Cadenza", "Syncopation", "Libretto"], accent: "blush" },
  { name: "The Games Pack", words: 30, description: "Chess terms, card game vocabulary, and the etymology of sport and play. Thirty words, all with better origins than you'd expect.", examples: ["Gambit", "Stalemate", "Mulligan"], accent: "lavender" }
];

const packDetails: Record<string, { subpacks: string[], featuredWords: { word: string, etymology: string }[] }> = {
  "The Literary Pack": { subpacks: ["Shakespeare Vol. 1", "Shakespeare Vol. 2", "Milton", "Chaucer", "The Romantics", "Dickens", "Carroll & Dahl", "Tolkien", "Orwell"], featuredWords: [{ word: "Pandemonium", etymology: "Coined by Milton in Paradise Lost, 1667. From Greek pan (all) + daimon (spirit)." }, { word: "Chortle", etymology: "Invented by Lewis Carroll in Through the Looking-Glass, 1871. A blend of chuckle and snort." }, { word: "Assassination", etymology: "First used by Shakespeare in Macbeth, 1606. From Arabic hashshashin." }] },
  "The Loan Words Pack": { subpacks: ["From the French", "From the Germanic", "From the Spanish", "From the East", "From Persia and Arabia", "From the Italian", "From South Asia", "From the North", "From the Americas", "From Africa", "From the Pacific", "From the Classical World", "The Curious and Unexpected"], featuredWords: [{ word: "Schadenfreude", etymology: "From German: Schaden (harm) + Freude (joy). Pleasure from another's misfortune." }, { word: "Juggernaut", etymology: "From Hindi Jagannath, a title of the god Vishnu. Via colonial British usage." }, { word: "Labyrinth", etymology: "From Greek labyrinthos. Possibly from Lydian labrys (double axe)." }] },
  "The Mythology Pack": { subpacks: ["Greek Mythology", "Roman Mythology", "Norse Mythology", "Egyptian Mythology", "Celtic Mythology"], featuredWords: [{ word: "Narcissism", etymology: "From Narcissus, the Greek youth who fell in love with his own reflection." }, { word: "Panic", etymology: "From Pan, the Greek god whose sudden appearances caused terror." }, { word: "Valhalla", etymology: "From Old Norse Valhöll — hall of the slain. Where Odin's warriors feasted." }] },
  "The Science Pack": { subpacks: ["Biology & Medicine", "Chemistry", "Earth & Climate", "Physics & Technology", "Space & Astronomy"], featuredWords: [{ word: "Entropy", etymology: "Coined by Rudolf Clausius in 1865. From Greek entropia — a turning toward." }, { word: "Quark", etymology: "Coined by physicist Murray Gell-Mann in 1964, from a line in James Joyce's Finnegans Wake." }, { word: "Laser", etymology: "Acronym coined in 1959: Light Amplification by Stimulated Emission of Radiation." }] },
  "The Eponym Pack": { subpacks: ["Literary Eponyms", "Historical & Political", "Scientific Eponyms", "Fashion Eponyms", "Food Eponyms", "Inventions & Brands"], featuredWords: [{ word: "Kafkaesque", etymology: "From Franz Kafka, whose novels depicted nightmarish bureaucratic helplessness." }, { word: "Wellington", etymology: "Named after the Duke of Wellington, who popularised the rubber boot style." }, { word: "Bowdlerise", etymology: "From Thomas Bowdler, who published an expurgated edition of Shakespeare in 1818." }] },
  "The Geography Pack": { subpacks: ["Landforms", "Waters & Coasts", "Climate & Weather", "Biomes & Vegetation", "Geological Features"], featuredWords: [{ word: "Fjord", etymology: "From Old Norse fjörðr — a narrow sea inlet between cliffs." }, { word: "Savanna", etymology: "From Spanish sabana, borrowed from Taino zabana. An open tropical grassland." }, { word: "Archipelago", etymology: "From Italian arcipelago — the Aegean Sea. From Greek archi (chief) + pelagos (sea)." }] },
  "The Architecture Pack": { subpacks: ["Structural Elements", "Spaces & Interiors", "Styles & Movements", "Materials", "Urban Design"], featuredWords: [{ word: "Cantilever", etymology: "Origin uncertain, possibly from cant (angle) + lever. A beam supported at one end only." }, { word: "Clerestory", etymology: "From Middle English: clear + story. The upper windowed section of a church wall." }, { word: "Brutalist", etymology: "From French béton brut — raw concrete. Coined by Le Corbusier." }] },
  "The Law Pack": { subpacks: ["Civil Law", "Contract Law", "Criminal Law", "Court & Procedure", "Latin Legal Terms"], featuredWords: [{ word: "Habeas corpus", etymology: "Latin: you shall have the body. A writ protecting against unlawful imprisonment." }, { word: "Tort", etymology: "From Old French tort, Latin tortus — twisted, wrong. A civil wrong giving rise to liability." }, { word: "Prima facie", etymology: "Latin: at first face. Evidence sufficient to establish a fact unless rebutted." }] },
  "The Music Pack": { subpacks: ["Classical & Orchestral", "Jazz & Blues", "Song & Folk", "Stage & Performance", "Instruments"], featuredWords: [{ word: "Cadenza", etymology: "From Italian cadenza — cadence, falling. A solo passage near the end of a movement." }, { word: "Syncopation", etymology: "From Greek synkoptein — to cut short. Rhythm that emphasises off-beats." }, { word: "Libretto", etymology: "From Italian libretto — little book. The text of an opera or musical work." }] },
  "The Games Pack": { subpacks: ["Chess & Strategy", "Cards & Gambling", "Sport & Athletics"], featuredWords: [{ word: "Gambit", etymology: "From Italian gambetto — a tripping up. An opening move accepting early sacrifice for advantage." }, { word: "Stalemate", etymology: "From Old French estal (fixed position) + mate (defeated). A draw in chess." }, { word: "Mulligan", etymology: "Disputed origin, possibly from David Mulligan, a Canadian golfer. A free second attempt." }] }
};

const bentoVariants = {
  initial: { 
    opacity: 0, 
    y: 20, 
    scale: 0.98 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 280, 
      damping: 22 
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.98,
    transition: { 
      duration: 0.2 
    }
  }
};

export default function PackGrid() {
  const [pausedIndex, setPausedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activePack = packs[activeIndex];
  const details = packDetails[activePack.name];
  const baseWords = details.featuredWords;
  const marqueeWords = [...baseWords, ...baseWords, ...baseWords, ...baseWords];
  // Alternate marquee direction randomly or by index
  const marqueeClass = activeIndex % 2 === 0 ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <section id="packs" className="w-full bg-[var(--color-white)] section-padding min-h-screen">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center flex flex-col items-center mb-16 md:mb-24"
        >
          <h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)] mb-6">
            Ten themed word packs.
          </h2>
          <p className="text-[var(--color-subtext)] text-lg md:text-[18px] max-w-[700px] leading-relaxed">
            From Shakespeare&apos;s coinages to Latin legal terms. From Tolkien&apos;s invented words to loan words borrowed from across the globe.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full">
          
          {/* Master List (Left Sidebar) */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 self-start flex flex-row lg:flex-col gap-2 md:gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 hide-scrollbar w-full relative z-20">
            {packs.map((pack, i) => (
              <button 
                key={i} 
                onClick={() => setActiveIndex(i)} 
                className={`text-left px-6 py-4 md:py-5 rounded-[20px] transition-all duration-300 whitespace-nowrap lg:whitespace-normal shrink-0 border border-transparent ${
                  activeIndex === i 
                    ? "bg-[var(--color-white)] shadow-[0_8px_32px_var(--card-shadow-2)] border-[var(--color-ink)] border-opacity-5"
                    : "hover:bg-[var(--color-ink)] hover:bg-opacity-[0.03] text-[var(--color-subtext)]"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`font-serif text-[20px] md:text-[24px] ${activeIndex === i ? "text-[var(--color-ink)]" : ""}`}>
                    {pack.name}
                  </h3>
                </div>
                <p className={`font-sans text-[13px] ${activeIndex === i ? "text-[var(--color-subtext)]" : "opacity-90"}`}>
                  {pack.words} words
                </p>
              </button>
            ))}
          </div>

          {/* Detail Panel (Right Side) */}
          <div className="lg:col-span-8 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={bentoVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="glass-card glass-card--raised rounded-[32px] md:rounded-[40px] p-0 flex flex-col lg:flex-row overflow-hidden relative group border border-[var(--color-ink)] border-opacity-5 w-full"
              >
                {/* Subtle gradient accent blob */}
                <div 
                  className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20"
                  style={{ backgroundColor: `var(--color-${activePack.accent})` }}
                />

                {/* SVG Noise Overlay */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />

                {/* Context Side: Info */}
                <div className="flex flex-col justify-between p-8 md:p-12 lg:w-[45%] shrink-0 relative z-10 border-b lg:border-b-0 lg:border-r border-[var(--color-ink)] border-opacity-5 bg-[var(--color-white)] bg-opacity-40">
                  <div>
                    <div className="mb-6">
                      <h4 className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-subtext)] mb-2">
                        {activePack.words} Curated Words
                      </h4>
                      <h3 className="font-serif text-[32px] md:text-[40px] text-[var(--color-ink)] leading-tight">
                        {activePack.name}
                      </h3>
                    </div>
                    
                    <p className="text-[var(--color-subtext)] text-[16px] md:text-[17px] leading-relaxed mb-8 pr-4">
                      {activePack.description}
                    </p>
                    
                    <div className="flex flex-col gap-3 mb-6">
                      <h4 className="font-sans text-[11px] uppercase tracking-widest text-[var(--color-subtext)]">
                        What&apos;s inside
                      </h4>
                      <p className="font-sans text-[14px] text-[var(--color-ink)] leading-relaxed">
                        {details.subpacks.slice(0, 6).join(" · ")}
                        {details.subpacks.length > 6 && " · and more"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[var(--color-gold)] border-opacity-30 self-start pr-8">
                    <span className="font-serif italic text-[19px] text-[#8c6318]">
                      Included with Zazu Gold
                    </span>
                  </div>
                </div>

                {/* Right Side: Bento Marquee */}
                <div className="relative w-full lg:w-[55%] bg-[var(--color-white)] bg-opacity-50 overflow-hidden flex items-center py-12 lg:py-0 min-h-[400px]">
                  
                  {/* Faded edges to blend the marquee seamlessly */}
                  <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-[var(--color-white)] to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-[var(--color-white)] to-transparent z-10 pointer-events-none" />

                  {/* Marquee Track */}
                  <div 
                    className={`flex gap-6 px-6 ${marqueeClass} pause-on-hover w-max`}
                    style={{ animationPlayState: pausedIndex === activeIndex ? 'paused' : undefined }}
                    onTouchStart={() => setPausedIndex(activeIndex)}
                    onTouchEnd={() => setPausedIndex(null)}
                    onTouchCancel={() => setPausedIndex(null)}
                  >
                    {marqueeWords.map((fw, j) => (
                      <div
                        key={j}
                        className="w-[280px] md:w-[320px] shrink-0 bg-[var(--color-white)] rounded-[24px] p-8 shadow-[0_8px_24px_var(--card-shadow-1)] border border-[var(--color-ink)] border-opacity-[0.03] hover:shadow-[0_12px_32px_var(--card-shadow-2)] transition-all duration-300 transform hover:-translate-y-1 cursor-default group/card flex flex-col justify-center relative overflow-hidden"
                      >
                        {/* Noise overlay for individual cards */}
                        <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
                        
                        <h4 className="font-serif text-[28px] md:text-[32px] text-[var(--color-ink)] mb-4 relative z-10">
                          {fw.word}
                        </h4>
                        <p className="font-sans text-[14px] text-[var(--color-subtext)] leading-relaxed italic line-clamp-4 group-hover/card:text-[var(--color-ink)] transition-colors duration-300 relative z-10">
                          {fw.etymology}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
