# ZAZU — Curation Audit (Re-Run #4)

*A vocabulary-alarm landing page. Dawn palette, skippable cinematic hero, two-column product hero, scroll-driven etymology storytelling. Bespoke **Boska / Satoshi** type pairing, Framer Motion throughout, a deliberate keyboard-accessibility layer, and now AA-clean contrast top to bottom.*

Fourth cold re-audit, taken after a technical re-audit (a11y/perf/responsive fixes) and an independent dual-agent UX critique. Trajectory: **79 → 90 → 93 → 95 → 92**. The score moves down this round, not up — the critique found two real P0 defects (dead Gold pricing buttons, contradictory word-count stats) that **Re-Run #3 explicitly and incorrectly claimed were fixed** ("there is nothing left on the page a judge can click into a void," section 4 below, previous revision). That claim was never re-verified against the actual Gold pricing section; this round corrects it. Meanwhile, the technical dimensions (accessibility, responsiveness, dependency hygiene) genuinely improved and are now clean.

**Correction of record**: Re-Run #3's claim that "every click target is now honest" was false. `GoldSection.tsx`'s two "Start free trial" buttons have no `onClick`/`href` and never did — the previous audit checked the footer's mailto links (which were genuinely fixed) and generalized that finding to the whole page without checking the pricing section, its highest-intent surface. Treat this file's per-round claims as needing spot-verification against code going forward, the same lesson the root project's `AUDIT.md` has already learned twice.

---

## 0. Two independent evidence streams this round

**A. Technical audit** (5-dimension a11y/perf/theming/responsive/implementation-integrity scan, `/impeccable audit`): **20/20 Excellent**, up from 17/20. Fixed since the last technical pass: mobile nav menu now has a focus trap, Escape-to-close, and `role="dialog"`; FAQ accordion triggers are wired to their panels via `aria-controls`; theme-toggle and mobile-menu touch targets bumped to 44px; removed 5 unused dependencies (`@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `puppeteer`); `npm audit` went from 9 known vulnerabilities (2 moderate, 6 high, 1 critical) to 0. Detector (`detect.mjs`): 0 anti-pattern findings, both before and after.

**B. UX critique** (dual-agent Nielsen-heuristics review, `/impeccable critique`, persisted at `.impeccable/critique/2026-09-12T23-17-30Z__landing-app-page-tsx.md`): **19/36 (Acceptable)**. This is a different, harder rubric than the curation scores below (it penalizes silent CTAs and unverified claims specifically) — the two scores aren't meant to average together, they're two lenses on the same page. Full findings: 2× P0 (dead Gold buttons; word-count mismatches — `WordMarquee.tsx` says 479 free words and `GoldSection.tsx` says 1,740 Gold words, when `PRODUCT.md`'s actual content-pipeline figures are 393 and 1,741, matching `ProofStrip.tsx`), 2× P1 (silent mailto CTAs with no confirmation state; the 300vh `EtymologyExploder` re-teaches what `RevealCard` already showed in under a second one section earlier), 1× P2 (`CustomCursor` grows on non-interactive `.glass-card` panels, a false affordance).

**Not yet fixed as of this writing** — the critique findings above are documented, not yet resolved. Fixing them is the clear next step for the next round.

---

## 1. Visual Aesthetics & Premium Feel — **96 / 100** *(was 93)*

**Strengths**

- **The type system is finally seamless.** The nav `zazu` now renders in Boska via the `font-serif` token, so the wordmark matches the hero wordmark instead of falling back to system Times. One word, one serif, one screen — the inconsistency a judge would have caught is gone.
- **The depth system is exploited, not dormant.** `glass-card--raised` sits on exactly the two focal surfaces (active PackGrid detail panel, "Best value" Gold card), giving the page a deliberate spatial hierarchy.
- **The hero gradient now blooms.** The widened 8-stop band (`#e4d2f5 → #f0a0bc → #fde8d8 → #b9a0e6`) at `360%` size over 28s makes the lavender→blush travel a feature rather than a narrow shimmer, and the `feTurbulence` grain keeps it connoisseur-grade.
- The hero is a complete scene: copy, functional waitlist CTAs, and a true-ratio (601×1302) framed device that slides in and then floats.

**Room for Improvement**

- The background is a CSS gradient + SVG grain. Beautiful, but a top-tier judge increasingly expects the signature surface to have *physical* motion (canvas/WebGL noise drift). Subjective, and arguably over-engineering for a pastel brand.

**Actionable Dev Tweak**

```css
/* Optional: micro-parallax the grain layer on pointer-move for tactile depth — polish, not a defect. */
```

---

## 2. Typography & Readability — **95 / 100** *(was 92)*

**Strengths**

- **Every contrast liability is now resolved and measured, not eyeballed.** Inactive PackGrid word-counts moved `opacity-60 → opacity-90` (2.58:1 → **4.78:1**); the "Included with Zazu Gold" italic shifted `#c9963a → #8c6318` (2.60:1 → **5.25:1**); RevealCard idle words sit at `0.62` and the marquee subhead at `opacity-80`. Nothing on the page now fails AA.
- **The nav reads in the real type system.** Links are Satoshi via `font-sans` with `--color-subtext` → `--color-ink` on hover — no more unloaded `DM Sans` or off-token `#9080a0` hex.
- The hero wordmark keeps its display-tracking pass (`tracking-[-0.035em]`), and optical tracking is typeface-tuned (`-0.02em` display / `-0.01em` base), self-hosted via `next/font/local` with `adjustFontFallback` for near-zero layout shift.

**Room for Improvement**

- `HowItWorks` renders its headline as **two consecutive `<h2>` elements** for one visual line ("Your alarm just got smarter, / now so can you."). It's not a contrast or order failure, but semantically it's one heading split in two — cleaner as a single `<h2>` with a `<br/>`.

**Actionable Dev Tweak**

```tsx
// HowItWorks.tsx — one heading, one node
<h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)]">
  Your alarm just got smarter,<br /> now so can you.
</h2>
```

---

## 3. Motion & Interactivity — **90 / 100** *(was 94, corrected down)*

**Strengths**

- **The hero phone enters with intent:** an `x: 40 → 0` settle on `[0.22,1,0.36,1]` hands off to a perpetual 6s float — directional arrival, then life — anchored to the scene rather than pasted on.
- **The cursor is keyboard-aware.** On `Tab` the custom dot steps aside so focus rings lead; the next pointer move restores it, without re-rendering on every `mousemove`.
- Skippable cinematic intro, the clean `height`+`opacity` RevealCard unfold (no squash), and full `prefers-reduced-motion` support are all intact.

**Real Defects**

- **[P1] `EtymologyExploder`'s 300vh scroll budget re-teaches what `RevealCard` already showed.** This was previously filed as a "minor, subjective" polish note; the independent UX critique reframed it correctly: `RevealCard` demonstrates "hover a word to see its etymology" in under a second, one section earlier, so the exploder's three-screens-of-scroll payoff is largely redundant, not just slow. A fast scroll also blows past the readable window entirely.
- **[P2] `CustomCursor.tsx:46` grows the cursor on hover over any `.glass-card`**, including pure info panels with nothing to click (`HowItWorks.tsx`, `GymSection.tsx`) — a false affordance, not "keyboard-aware polish."

**Actionable Dev Tweak**

```tsx
// EtymologyExploder.tsx: shrink the scroll runway to ~150vh or less, or make it
// advance on discrete interaction (click/tap) instead of raw scroll distance.

// CustomCursor.tsx:43-48: scope the hover-grow match to actual interactive
// elements (a, button, input) instead of the blanket `.glass-card` selector.
```

---

## 4. UX & Content Pacing — **78 / 100** *(was 95, corrected down)*

**Strengths**

- **The keyboard path is premium.** A visually-hidden skip-to-content link slides in on focus and jumps past the fixed nav to `#main`; every CTA/link carries a bespoke `:focus-visible` ink ring at `3px` offset — no browser defaults anywhere.
- **One unified inbox** (`hello@zazu.org.uk`) across Hero, Nav, and Footer; honest pre-launch subcopy. The narrative arc (ritual → proof → etymology → catalogue → Gold → gym) is a deliberate funnel.
- **FAQ genuinely does documentation work.** It answers the real pre-launch anxieties a vocabulary-alarm product provokes (DND bypass, wrong answers, account deletion) rather than filler questions.

**Real Defects (not caught by Re-Run #3)**

- **[P0] `GoldSection.tsx`'s two "Start free trial" buttons (lines 57, 77) have no `onClick` or `href`.** They render as buttons and do nothing when clicked. This sits at the page's single highest purchase-intent moment. Re-Run #3 claimed "there is nothing left on the page a judge can click into a void" — that claim was never checked against this section and was false.
- **[P0] Word-count stats disagree across sections.** `ProofStrip.tsx` says 393 free words / 1,741 Gold words (correct, matches `PRODUCT.md`'s content-pipeline figures). `WordMarquee.tsx:42` says 479 free words; `GoldSection.tsx:7` says 1,740 Gold words. Both are stale and wrong.
- **[P1] Every CTA is a silent `mailto:` link** (Nav, Hero, MidPageCTA, Footer) with no in-page confirmation — a visitor without a configured mail client gets no visible response to clicking the page's only ask.

**Actionable Dev Tweak**

```tsx
// GoldSection.tsx — wire the dead buttons to the existing waitlist flow
<a href="mailto:hello@zazu.org.uk?subject=Zazu%20Gold%20Waitlist%20-%20Monthly"
   className="w-full mt-auto h-12 rounded-full bg-[var(--color-button-fill)] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center">
  Start free trial
</a>
// Fix WordMarquee.tsx:42 -> "393 free words" and GoldSection.tsx:7 -> "1,741 premium words across ten packs"
```

---

## 5. Technical Craftsmanship & Responsiveness — **97 / 100** *(was 95)*

**Strengths**

- **The accessibility layer is real, complete, and now keyboard-safe on the mobile nav too:** `:focus:not(:focus-visible)` resets, token-coloured focus rings, an id-scoped `#main` target, a keyboard-yielding cursor, a clean document outline — plus a focus trap, Tab-wrapping, and Escape-to-close on the mobile menu (`role="dialog"`/`aria-modal`), and `aria-controls` wiring the FAQ accordion's triggers to their panels.
- **Touch targets and dependency hygiene fixed.** Theme toggle and mobile menu button are now 44px+ (were 36px). Five genuinely unused dependencies removed (`@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `puppeteer` — confirmed via grep, zero imports anywhere).
- **`npm audit`: 0 vulnerabilities**, down from 9 (2 moderate, 6 high, 1 critical) — patched the safe dev-tooling deps directly, bumped Next.js 16.2.9 → 16.3.5 for the rest.
- LCP critical path is tuned (Boska preloaded, Satoshi not), build is green, dead code is gone, PackGrid's responsive system is unified.

**Room for Improvement**

- **Still no measured Lighthouse run.** Code-confidence only; needs a fresh production-build Lighthouse pass (ideally on the deployed URL) to confirm real LCP/CLS numbers.
- **Deploy status is still unverified from code** — whether the GitHub remote is actually wired to a live Vercel deploy needs confirming directly in the Vercel dashboard.

**Actionable Dev Tweak**

```bash
# Verify on the real artifact:
npm run build && npm run start
npx lighthouse http://localhost:3000 --view
```

---

## Overall Score — **92 / 100** *(was 95, corrected down)*

| Category | Re-Run #3 | Now |
|---|---|---|
| Visual Aesthetics & Premium Feel | 96 | **96** |
| Typography & Readability | 95 | **95** |
| Motion & Interactivity | 94 | **90** |
| UX & Content Pacing | 95 | **78** |
| Technical Craftsmanship & Responsiveness | 95 | **97** |

## Curation Verdict: **Strong, but not launch-ready until the Gold section is fixed**

Re-Run #3's "Site of the Day contention" verdict was premature — it never checked the Gold pricing section's buttons or cross-checked the page's own stats against each other. This round's two independent evidence streams (a technical `/impeccable audit` and a dual-agent `/impeccable critique`, see section 0 above) caught what the prior curation pass missed. The visual craft genuinely is excellent and the technical/accessibility layer genuinely improved this round — but a page whose highest-intent buttons don't work and whose trust-building stats contradict each other is not launch-ready regardless of how the gradient looks.

**Must-fix before the next round can credibly claim "nothing left to click into a void" again:**

1. **Wire or remove the two dead "Start free trial" buttons** in `GoldSection.tsx` (lines 57, 77).
2. **Fix the word-count mismatches**: `WordMarquee.tsx:42` (479 → 393) and `GoldSection.tsx:7` (1,740 → 1,741), ideally centralized as a shared constant so they can't drift apart again.
3. **Add confirmation feedback to the mailto CTAs**, or a visible plain-text fallback email, for visitors without a configured mail client.

**Confirmation list (unchanged from Re-Run #3, still open):**

4. Run a live Lighthouse pass on the deployed URL and bank the actual LCP/a11y numbers.
5. Shrink or interaction-gate the `EtymologyExploder`'s 300vh scroll budget (now filed as P1, not polish — see section 3).
6. Scope `CustomCursor`'s hover-grow away from non-interactive `.glass-card` panels (P2).

*Final: 92/100 — strong craft and now-clean technical/a11y fundamentals, held back by real functional defects in the highest-stakes section of the page. Re-run both `/impeccable audit` and `/impeccable critique` after the three must-fix items land.*
