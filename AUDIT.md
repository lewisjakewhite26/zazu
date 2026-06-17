# Zazu product audit (round 6)

**Date:** June 2026  
**Overall score: ~89 / 100** (up from ~88 after mobile home UI prototype alignment)  
**Vision-aligned product: ~80 / 100** (up from ~78; home screen now matches web prototype exactly)

See [ROADMAP.md](ROADMAP.md) for what to build next. Design tokens and alignment status: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

---

## Score by area

| Area | Score | Δ vs R4 | Summary |
|------|------:|---------|---------|
| **Product vision & UX** | 80 | +2 | Home screen matches `index.html` light + dark; alarm flow still uses legacy styling on mobile. |
| **Mobile app** | 91 | +2 | Home prototype-aligned (`theme.ts` from HTML, glass cards, WOTD hero, animated toggle); nine routes; alarm flow functional. |
| **Web prototype** | 88 | 0 | Source of truth for design tokens; alarm path uses `fetchAlarmWords` + morning task UI; gradual light/dark theme. |
| **Content & words** | 96 | 0 | **395 words** (A–Z), morning tasks validated, Supabase synced. |
| **Backend & data** | 93 | 0 | Unchanged; auth and cloud progress still unwired. |
| **Monetisation** | 26 | 0 | All words free; Gold is calendar UI preview only. |
| **Launch readiness** | 68 | +3 | Core product loop matches vision; P1 #9 device sign-off still open. |
| **Documentation & ops** | 86 | +4 | README, ROADMAP, DESIGN_SYSTEM, and this audit refreshed; approved home screenshots in `New SS/`. |

**Weighted overall: ~89/100**

**Vision-aligned product score: ~80/100**

---

## What improved since round 5 (~88)

### Shipped and real

- **Mobile home UI prototype alignment:** exact tokens from `index.html` (`theme.ts`), night-snap adaptive palette, `GradientBackground`, `GlassCard`, `AnimatedToggle`, WOTD hero — approved light/dark screenshots (`New SS/home-light.png`, `New SS/home-dark.png`)
- **Design system doc:** `DESIGN_SYSTEM.md` documents tokens, primitives, and per-screen alignment status
- **Expo web stability:** removed `useFocusEffect` from shared hooks (SDK 56 crash fix)

### Still open

- **P2 #36:** Finalise mobile UI for all remaining pages (alarm flow, calendar, gym, settings, onboarding, Gold)
- Auth, IAP, P1 #9 device verification

---

## Critical gaps (ordered by impact)

### 1. Mobile UI consistency (P2 #36)

Home matches `index.html`. Alarm flow, calendar, Word Gym tab, settings, onboarding, and Gold still use legacy styling — need the same token system and UI primitives applied screen by screen.

### 2. Monetisation

All 395 words remain free. Gold preview in calendar is not billable.

### 3. Device sign-off (P1 #9)

Notifications, audio, and kill/reopen need verification on a real device via EAS dev build.

### 4. Smaller gaps

- Mobile Supabase fetch failures still fail silently (demo fallback)
- Shared game logic (#10) still partially duplicated
- `zazu-words.schema.json` still behind current JSON shape
- No analytics or crash reporting

---

## What is genuinely strong

- **Vision-aligned alarm:** Learn-first wake-up, not a 12-pair puzzle at 7am
- **Content at scale:** 395 words, validated pipeline, one-command seed
- **Architecture:** Alarm vs Gym split end-to-end in UI and Supabase
- **Mobile foundation:** Expo 56, typed routes, notifications, calendar, design system
- **CI:** `seed:dry`, morning-task check, mobile `tsc` on every PR

---

## Top 5 fixes next (by impact)

1. **Word Gym tab** + gym success recap + calendar `gymCompleted` wiring
2. **P1 #9 device checklist** on EAS dev build
3. **Full adaptive theme** on home and calendar
4. **Supabase Auth + IAP** when ready to gate Gold
5. **Deploy web to Vercel** for stable phone browser testing

After (1) and (2), vision-aligned score could reach **~82+** and overall **~90+**.

---

## Revenue estimate (monthly, GBP)

**Current realistic monthly revenue: £0** (pre-monetisation, pre-store, all content free).

| Scenario | MAU | Conversion | Est. monthly |
|----------|-----|------------|--------------|
| Low (soft launch) | 200–800 | 0–1% | £0–£150 |
| Medium (6–12 mo) | 3k–12k | 2–3.5% | £250–£1,800 |
| High (breakout) | 40k–120k | 3–5% | £5k–£25k |

---

## Audit history

| Round | Date | Overall | Vision | Notes |
|-------|------|---------|--------|-------|
| 1 | Early build | ~58 | — | Single-file prototype, 36 words |
| 2 | After P0/P1 | ~79 | — | Mobile flow, Supabase 98 words |
| 3 | P2 + morning tasks | ~83 | ~65 | Morning-task data; UX pivot pending |
| 4 | 395 words + calendar | ~85 | ~68 | Full library live; alarm UX still legacy |
| 5 | Gentle alarm + theme | **~88** | **~78** | P2b alarm flow shipped; Gym tab open |

---

## Bottom line

**~88/100** as a build, content, and platform score.  
**~78/100** as a shippable product matching the latest vision.

The main remaining gap for a store-ready v1 is **Word Gym as a first-class surface**, **device verification**, and **monetisation wiring**.
