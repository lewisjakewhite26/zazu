"use client";

import { motion } from "framer-motion";

const features = [
  "Every word pack included",
  "1,740 premium words across ten packs",
  "Full 30-day word history",
  "Spaced repetition review",
  "Etymology roots drill",
  "Usage lab practice",
  "Pack focus gym sessions",
  "Future packs included"
];

function CheckmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-correct)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

export default function GoldSection() {
  return (
    <section id="gold" className="w-full gold-gradient section-padding">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center flex flex-col items-center mb-16"
        >
          <h2 className="font-serif text-[clamp(50px,8vw,80px)] leading-tight text-[var(--color-ink)] mb-4">
            Zazu Gold.
          </h2>
          <p className="text-[var(--color-ink)] opacity-70 text-[20px] md:text-[24px]">
            Every word pack. Full history. Advanced practice. £1.99 a month.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-[800px] mb-16">
          {/* Monthly Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02 }}
            className="flex-1 glass-card rounded-[24px] p-8 flex flex-col items-center text-center"
          >
            <div className="font-serif text-[48px] text-[var(--color-ink)] leading-none mb-2">£1.99</div>
            <div className="text-[var(--color-subtext)] text-[16px] mb-1">per month</div>
            <div className="text-[var(--color-ink)] font-medium text-[14px] mb-8">7-day free trial</div>
            <button className="w-full mt-auto h-12 rounded-full bg-[var(--color-button-fill)] text-white font-medium hover:opacity-90 transition-opacity">
              Start free trial
            </button>
          </motion.div>

          {/* Annual Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex-1 glass-card glass-card--raised rounded-[24px] p-8 flex flex-col items-center text-center relative border-2 border-[var(--color-gold)] border-opacity-30"
          >
            <div className="absolute -top-4 bg-[var(--color-gold)] text-white text-[12px] font-bold uppercase tracking-wider py-1 px-4 rounded-full">
              Best value
            </div>
            <div className="font-serif text-[48px] text-[var(--color-ink)] leading-none mb-2">£14.99</div>
            <div className="text-[var(--color-subtext)] text-[16px] mb-1">per year</div>
            <div className="text-[var(--color-gold)] font-medium text-[14px] mb-8">Save 37%</div>
            <button className="w-full mt-auto h-12 rounded-full bg-[var(--color-button-fill)] text-white font-medium hover:opacity-90 transition-opacity">
              Start free trial
            </button>
          </motion.div>
        </div>

        {/* Feature List */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full max-w-[800px]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckmarkIcon />
                <span className="text-[var(--color-ink)] text-[16px] md:text-[18px] font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
