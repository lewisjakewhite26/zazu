'use client'

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

export default function Nav() {
  const { scrollY } = useScroll()
  const prefersReducedMotion = useReducedMotion()
  const background = useTransform(
    scrollY,
    [0, 80],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)']
  )
  const backdropBlur = useTransform(
    scrollY,
    [0, 80],
    ['blur(0px)', 'blur(12px)']
  )

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: prefersReducedMotion ? 0 : 1.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ background, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
    >
      <span className="font-serif text-[20px] lowercase text-[var(--color-ink)] leading-none">
        zazu
      </span>
      <div className="flex items-center gap-8">
        <Link href="#how-it-works" className="font-sans text-[14px] text-[var(--color-subtext)] hover:text-[var(--color-ink)] transition-colors">
          How it works
        </Link>
        <Link href="#packs" className="font-sans text-[14px] text-[var(--color-subtext)] hover:text-[var(--color-ink)] transition-colors">
          Word packs
        </Link>
        <Link href="#gold" className="font-sans text-[14px] text-[var(--color-subtext)] hover:text-[var(--color-ink)] transition-colors">
          Gold
        </Link>
        <a
          href="mailto:hello@zazu.org.uk?subject=Zazu%20Early%20Access%20Waitlist"
          className="px-5 py-2 bg-ink text-white text-[14px] rounded-full font-medium hover:bg-ink/90 transition-colors"
        >
          Join the Waitlist
        </a>
      </div>
    </motion.nav>
  )
}
