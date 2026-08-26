# ZAZU — Curation Audit (Re-Run #3)

*A vocabulary-alarm landing page. Dawn palette, skippable cinematic hero, two-column product hero, scroll-driven etymology storytelling. Bespoke **Boska / Satoshi** type pairing, Framer Motion throughout, a deliberate keyboard-accessibility layer, and now AA-clean contrast top to bottom.*

Third cold re-audit, taken after the accessibility-and-contrast pass. Trajectory: **79 → 90 → 93 → 95**. The previous round's headline defects — the nav type regression and the dead footer store buttons — are both gone, and the last WCAG flags (sub-threshold contrast, a skipped heading level) are closed. The code-level "must-fix" list is now essentially empty; what stands between this and a 97 is verification (a live Lighthouse pass), one manual environment chore, and a couple of genuinely subjective polish calls.

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

## 3. Motion & Interactivity — **94 / 100** *(was 93)*

**Strengths**

- **The hero phone enters with intent:** an `x: 40 → 0` settle on `[0.22,1,0.36,1]` hands off to a perpetual 6s float — directional arrival, then life — anchored to the scene rather than pasted on.
- **The cursor is keyboard-aware.** On `Tab` the custom dot steps aside so focus rings lead; the next pointer move restores it, without re-rendering on every `mousemove`.
- Skippable cinematic intro, the clean `height`+`opacity` RevealCard unfold (no squash), and full `prefers-reduced-motion` support are all intact.

**Room for Improvement**

- The `EtymologyExploder` — the signature set-piece — still pins to a fixed `300vh` scroll budget; on very tall monitors the fragment hold can feel slightly slow relative to scroll distance. Minor and subjective.

**Actionable Dev Tweak**

```tsx
// Optional: clamp fragment timing against viewport height on tall screens — polish, not a defect.
```

---

## 4. UX & Content Pacing — **95 / 100** *(was 93)*

**Strengths**

- **Every click target is now honest.** The footer store buttons resolve to platform-tagged waitlist mailtos (`— iOS` / `— Android`) instead of dead `href="#"`; the dead "About" link is gone. There is nothing left on the page a judge can click into a void.
- **The keyboard path is premium.** A visually-hidden skip-to-content link slides in on focus and jumps past the fixed nav to `#main`; every CTA/link carries a bespoke `:focus-visible` ink ring at `3px` offset — no browser defaults anywhere.
- **Conversion correctness is airtight:** one unified inbox (`hello@zazu.org.uk`) across Hero, Nav, and Footer; honest pre-launch subcopy; copy consistent with the metadata ("1,700+ premium words"). The narrative arc (ritual → proof → etymology → catalogue → Gold → gym) is a deliberate funnel.

**Room for Improvement**

- Pre-launch, *all* primary actions funnel to the same mailto. It's correct for a waitlist, but a single embedded email-capture field would out-convert "open your mail client" for users on a machine without a configured client. A post-launch consideration, not a defect.

**Actionable Dev Tweak**

```tsx
// Post-launch: swap the hero mailto for an inline email <form> → /api/waitlist (or a form service).
```

---

## 5. Technical Craftsmanship & Responsiveness — **95 / 100** *(was 92)*

**Strengths**

- **The accessibility layer is real and complete in code:** `:focus:not(:focus-visible)` resets, token-coloured focus rings that follow each element's own radius, an id-scoped `#main` target, a keyboard-yielding cursor — **and now a clean document outline** (the marquee word dropped from `<h4>` to `<div>`, removing the only `h2 → h4` skip).
- **LCP critical path is tuned:** Boska (the giant wordmark, the LCP element) keeps `preload: true`, while Satoshi now sets `preload: false` so the body weights stop competing in the critical request chain — body text swaps cleanly via `display:swap` + `adjustFontFallback`, keeping CLS at 0.
- Build is green, dead code is gone, the hero asset is a true-format PNG at true 601×1302 ratio, the `EtymologyExploder` short-viewport clip is fixed, and PackGrid's responsive system is unified at `lg:` (no 1024–1280 dead zone).

**Room for Improvement**

- **The score above is code-confidence, not a measured Lighthouse run.** The last live audit showed a ~4.0s LCP on a throttled local CPU; the font-preload change should help, but it needs a fresh production-build Lighthouse pass (ideally on the deployed Vercel URL) to confirm the 100s.
- **The project still lives in OneDrive**, which intermittently locks `.next` (`EPERM`) — an avoidable, non-code build flake *(manual exclusion pending)*.

**Actionable Dev Tweak**

```bash
# Verify on the real artifact:
npm run build && npm run start
npx lighthouse http://localhost:3000 --view
```

---

## Overall Score — **95 / 100** *(was 93)*

| Category | Re-Run #2 | Now |
|---|---|---|
| Visual Aesthetics & Premium Feel | 93 | **96** |
| Typography & Readability | 92 | **95** |
| Motion & Interactivity | 93 | **94** |
| UX & Content Pacing | 93 | **95** |
| Technical Craftsmanship & Responsiveness | 92 | **95** |

## Curation Verdict: **Site of the Day contention**

The two defects that were holding the previous build at 93 — the nav serif falling back to Times beside a Boska hero, and the footer store buttons going nowhere — are gone. With them closed, plus AA-clean contrast, a clean heading outline, a tuned LCP font path, and a true-ratio hero device, this crosses from "strong nomination" into genuine **Site of the Day** territory on craft alone.

What's left is no longer a fix list — it's a confirmation list:

1. **Run a live Lighthouse pass** on the production build / deployed URL and bank the actual numbers (especially LCP and the a11y 100).
2. **Get the build out of OneDrive's way** so `.next` stops locking *(manual)*.
3. **Optional polish** — single-node `HowItWorks` heading, viewport-aware `EtymologyExploder` timing, a tactile grain layer. All upside, no defect.

*Final: 95/100 — Site of the Day contention; the remaining gap to 97 is verification and taste, not repair.*
