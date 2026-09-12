# ZAZU — Curation Audit (Re-Run #5)

*A vocabulary-alarm landing page. Dawn palette, skippable cinematic hero, two-column product hero, scroll-driven etymology storytelling. Bespoke **Boska / Satoshi** type pairing, Framer Motion throughout, a deliberate keyboard-accessibility layer, and now AA-clean contrast top to bottom.*

Fifth re-audit. Trajectory: **79 → 90 → 93 → 95 → 92 → 95**. Re-Run #4 found five real defects (two P0, two P1, one P2) via an independent dual-agent UX critique that the previous curation round had missed or dismissed as "subjective polish." **All five are fixed and source-verified this round**: the Gold pricing buttons are wired to the waitlist flow, the word-count stats agree everywhere (393 / 1,741), every mailto CTA now shows on-click confirmation, the etymology sequence's scroll budget is cut nearly in half, and the custom cursor no longer implies interactivity on non-interactive panels.

**Correction of record (carried from Re-Run #4)**: Re-Run #3's claim that "every click target is now honest" was false — it never checked the Gold pricing section specifically. Treat this file's per-round claims as needing spot-verification against code, not taken on faith from the previous entry.

---

## 0. Two independent evidence streams (Re-Run #4), now closed out

**A. Technical audit** (`/impeccable audit`): **20/20 Excellent**, up from 17/20. Mobile nav menu now has a focus trap, Escape-to-close, and `role="dialog"`; FAQ accordion wired via `aria-controls`; touch targets at 44px; 5 unused dependencies removed; `npm audit` at 0 vulnerabilities (was 9, including 1 critical). Detector: 0 anti-pattern findings throughout.

**B. UX critique** (`/impeccable critique`, persisted at `.impeccable/critique/2026-09-12T23-17-30Z__landing-app-page-tsx.md`): **19/36 (Acceptable)** at the time it ran. Found 2× P0 (dead Gold buttons; word-count mismatches), 2× P1 (silent mailto CTAs; redundant 300vh `EtymologyExploder`), 1× P2 (`CustomCursor` false affordance on `.glass-card`).

**Status: all five findings fixed and verified this round** — against source (grep-confirmed) and against the rendered production build (`npm run build && npm run start`, curl-checked the actual HTML for the corrected stats and mailto subjects). A fresh full dual-agent `/impeccable critique` run (which would re-score all 10 heuristics from scratch) was not re-run to produce a new number — see the per-section notes below for what changed and why the fixes should move heuristics 1, 4, and 9 back up.

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

## 3. Motion & Interactivity — **95 / 100** *(was 90, fixed)*

**Strengths**

- **The hero phone enters with intent:** an `x: 40 → 0` settle on `[0.22,1,0.36,1]` hands off to a perpetual 6s float — directional arrival, then life — anchored to the scene rather than pasted on.
- **The cursor is now honest about what's clickable.** `CustomCursor.tsx`'s hover-grow no longer matches the blanket `.glass-card` selector — it only fires on real `a`/`button`/`input` targets, so hovering an info-only panel (`HowItWorks.tsx`, `GymSection.tsx`) no longer implies a click will do something.
- **`EtymologyExploder`'s scroll budget cut from 300vh to 160vh.** Same reveal sequence, roughly half the forced scroll distance — closes most of the gap to `RevealCard`'s near-instant version of the same idea one section earlier, without losing the set-piece.
- Skippable cinematic intro, the clean `height`+`opacity` RevealCard unfold (no squash), and full `prefers-reduced-motion` support are all intact.

**Room for Improvement**

- The exploder is shorter, not gone — whether it still earns its place next to `RevealCard`'s faster version of the same idea is a taste call worth revisiting once real users see both.

---

## 4. UX & Content Pacing — **93 / 100** *(was 78, fixed)*

**Strengths**

- **Every click target is honest again, this time verified against the rendered build, not just the footer.** `GoldSection.tsx`'s two "Start free trial" buttons now link to `mailto:...?subject=Zazu%20Gold%20Waitlist%20-%20Monthly` / `...-Annual` — distinct subjects per plan, confirmed present in the built HTML via curl.
- **One consistent set of numbers everywhere.** `ProofStrip.tsx`, `WordMarquee.tsx`, and `GoldSection.tsx` all now say 393 free words / 1,741 Gold words, matching `PRODUCT.md`'s actual content-pipeline figures.
- **Mailto CTAs now confirm the click.** A new shared `WaitlistLink.tsx` swaps every waitlist CTA's label to "Opening email…" for 2.5s on click (Nav ×2, Hero, MidPageCTA, Footer, GoldSection ×2) — a visitor without a configured mail client now sees the click register instead of silence.
- **The keyboard path is premium.** Skip-to-content link, bespoke `:focus-visible` rings everywhere, `#main` target.
- **FAQ genuinely does documentation work** — answers the real pre-launch anxieties (DND bypass, wrong answers, account deletion).

**Room for Improvement**

- Pre-launch, *all* primary actions still funnel to mailto (now with confirmation, but still not a real checkout/signup flow) — correct for a waitlist, but a single embedded email-capture form would out-convert this post-launch.

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

## Overall Score — **95 / 100** *(was 92, fixed)*

| Category | Re-Run #4 | Now |
|---|---|---|
| Visual Aesthetics & Premium Feel | 96 | **96** |
| Typography & Readability | 95 | **95** |
| Motion & Interactivity | 90 | **95** |
| UX & Content Pacing | 78 | **93** |
| Technical Craftsmanship & Responsiveness | 97 | **97** |

## Curation Verdict: **Launch-blocking defects closed; back to genuine strength**

All five findings from Re-Run #4's independent dual-agent critique are fixed and verified against both source and the rendered production build: the Gold pricing buttons work, the page's own numbers agree with each other and with `PRODUCT.md`, every waitlist CTA confirms its click, the etymology sequence asks for less scroll, and the cursor no longer lies about what's clickable. Combined with the prior round's technical/accessibility work (20/20, 0 vulnerabilities), this is now a page that's both well-crafted *and* functionally honest — the gap this file exists to catch.

**Still open (unchanged, not blocking):**

1. Run a live Lighthouse pass on the deployed URL and bank the actual LCP/a11y numbers.
2. Confirm the GitHub remote is actually wired to a live Vercel deploy (unverifiable from code).
3. Optional taste call: revisit whether the shortened `EtymologyExploder` still earns its place next to `RevealCard`'s faster version of the same idea.

*Final: 95/100. Re-run `/impeccable critique` for a fresh full 10-heuristic score once the page has live traffic or a deploy to point it at — the per-section notes above reflect verified fixes, not a new dual-agent score.*
