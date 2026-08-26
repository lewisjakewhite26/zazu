# ZAZU — Finishing Roadmap (95 → 97)

**Status:** Structural remediation, the finishing sprint, the accessibility pass, **and** the contrast/heading/LCP pass are all done. Current score **95/100** — Site of the Day contention.
**Goal:** The code-level fix list is empty. What remains is *confirmation* (a live audit), one manual environment chore, and a short menu of taste-level polish. None of it is a defect.

> ✅ **Completed since Re-Run #2:** nav fully tokenised (Boska/Satoshi, `--color-ink`/`--color-subtext`) — no inline DM fonts or off-token hex · footer store buttons → platform-tagged waitlist mailtos · dead "About" link removed · inactive pack counts `opacity-60 → opacity-90` (4.78:1) · gold footer italic `#c9963a → #8c6318` (5.25:1) · marquee word `<h4> → <div>` (clean heading outline) · Boska keeps `preload`, Satoshi `preload:false` (LCP critical-path) · true-ratio hero device (601×1302) · widened hero-gradient chroma band.

---

## 1. High Priority: Confirm the Numbers (Do This First)

These don't change code — they prove the 95 is real and bank the Lighthouse 100s.

### 1.1 — Run a live Lighthouse pass on the production build

- **The Task:** The current scores are code-confidence, not measured. The last live audit showed ~4.0s LCP on a throttled local CPU, before the font-preload change.
- **The Rationale:** A judge (and you) want the real Performance/A11y/Best-Practices/SEO numbers from the actual artifact, not the dev server. The Satoshi `preload:false` change should move LCP — confirm it.
- **Implementation:**

```bash
npm run build
npm run start          # serves the optimized build on :3000
npx lighthouse http://localhost:3000 --view
# Better still, run it against the deployed Vercel URL once pushed.
```

### 1.2 — Push & deploy, then re-audit the live URL

- **The Task:** Commit is in (`ecaf64c`); push to GitHub so Vercel rebuilds, then Lighthouse the production domain.
- **The Rationale:** Real CDN + real network is the environment a curator actually sees. Local throttling understates Performance.
- **Implementation:**

```bash
git push
# wait for Vercel deploy, then:
npx lighthouse https://<your-domain> --view
```

---

## 2. Medium Priority: Manual Environment Chore

### 2.1 — Get the build out of OneDrive's way

- **The Task:** OneDrive intermittently locks `.next` (`EPERM`) during builds.
- **The Rationale:** Avoidable, intermittent build failures unrelated to code — and a risk right before a deploy.
- **Implementation:** Exclude `zazu-website/.next` and `node_modules` from OneDrive sync, or move the project to a non-synced path (e.g. `C:\dev\zazu-website`).

---

## 3. Low Priority: Taste-Level Polish (All Upside, No Defect)

### 3.1 — Collapse the `HowItWorks` headline to a single node

- **The Task:** The headline is two consecutive `<h2>` elements for one visual line.
- **The Rationale:** Cleaner document semantics; one heading, not two.
- **Implementation:**

```tsx
<h2 className="font-serif text-[clamp(40px,5vw,64px)] leading-tight text-[var(--color-ink)]">
  Your alarm just got smarter,<br /> now so can you.
</h2>
```

### 3.2 — Viewport-aware `EtymologyExploder` timing

- **The Task:** The fragment set-piece pins to a fixed `300vh` budget; on very tall monitors the hold drags slightly.
- **The Rationale:** Pure pacing refinement on the signature moment.
- **Implementation:** Clamp the fragment `useTransform` ranges against viewport height (or a height `@media`), keeping the effect identical at standard sizes.

### 3.3 — Optional: tactile grain layer

- **The Task:** Give the dawn surface a hint of physical motion (pointer-driven parallax on the `feTurbulence` grain).
- **The Rationale:** Top-tier judges increasingly expect a signature surface to *move*. Subjective.
- **Implementation:** Translate the grain layer a few px on `mousemove` via a Framer motion-value; respect `prefers-reduced-motion`.

### 3.4 — Post-launch: inline email capture

- **The Task:** Replace the hero waitlist mailto with an inline `<form>` once a backend/form service exists.
- **The Rationale:** Out-converts "open your mail client" for users without a configured client. Not a pre-launch concern.

---

## Definition of Done (97 Gate)

| # | Check | Target Impact |
|---|---|---|
| 1.1 | Local Lighthouse confirms a11y 100 + improved LCP | Verifies Craftsmanship 95 |
| 1.2 | Live Vercel URL audited | Real-world Performance number |
| 2.1 | Stable builds, no `.next` EPERM | Craftsmanship finish |
| 3.1 | Single-node HowItWorks heading | Typography polish |
| 3.2 | Viewport-aware exploder timing | Motion polish |
| 3.3 | Tactile grain | Aesthetics polish |

**Projected post-verification score: 96–97 / 100 — Site of the Day submission-ready.**
