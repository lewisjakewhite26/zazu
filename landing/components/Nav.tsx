'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'

// Fixed literal white (not the theme-flipping --color-white surface token) --
// these sit on the toggle knob, which is a deliberately constant dark fill
// (--color-button-fill) in both themes, so the glyph needs to stay light too.
const GLYPH_COLOR = "#fefcfb";

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GLYPH_COLOR} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" fill={GLYPH_COLOR} stroke="none" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={GLYPH_COLOR} stroke="none">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#packs', label: 'Word packs' },
  { href: '#gold', label: 'Gold' },
]

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className="relative shrink-0 h-9 w-16 rounded-full border border-[var(--color-ink)]/15 bg-[var(--color-ink)]/5 transition-colors flex items-center px-1"
    >
      <motion.span
        className="absolute h-7 w-7 rounded-full bg-[var(--color-button-fill)] flex items-center justify-center"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </motion.span>
    </button>
  )
}

export default function Nav() {
  const { scrollY } = useScroll()
  const { theme } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDark = theme === 'dark'
  // framer-motion interpolates colors numerically, so it needs literal rgba
  // strings rather than CSS var() references -- pick the pair by theme state
  // instead (the hook itself is still called unconditionally every render).
  const background = useTransform(
    scrollY,
    [0, 80],
    isDark ? ['rgba(30,23,48,0)', 'rgba(30,23,48,0.85)'] : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)']
  )
  const backdropBlur = useTransform(
    scrollY,
    [0, 80],
    ['blur(0px)', 'blur(12px)']
  )

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 1.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ background, backdropFilter: backdropBlur }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-4"
      >
        <span className="font-serif text-[20px] lowercase text-[var(--color-ink)] leading-none">
          zazu
        </span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-[14px] text-[var(--color-subtext)] hover:text-[var(--color-ink)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <a
            href="mailto:hello@zazu.org.uk?subject=Zazu%20Early%20Access%20Waitlist"
            className="px-5 py-2 bg-[var(--color-button-fill)] text-white text-[14px] rounded-full font-medium hover:bg-[var(--color-button-fill)]/90 transition-colors whitespace-nowrap"
          >
            Join the Waitlist
          </a>
        </div>

        {/* Mobile: toggle + menu button */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-[var(--color-ink)]/5"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[64px] left-0 right-0 z-40 md:hidden glass-card mx-4 rounded-[24px] p-6 flex flex-col gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-sans text-[16px] text-[var(--color-ink)] py-3 border-b border-[var(--color-ink)]/5 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:hello@zazu.org.uk?subject=Zazu%20Early%20Access%20Waitlist"
              onClick={() => setMobileOpen(false)}
              className="mt-4 px-5 py-3 bg-[var(--color-button-fill)] text-white text-[15px] rounded-full font-medium text-center"
            >
              Join the Waitlist
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
