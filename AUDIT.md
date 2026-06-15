# Zazu product audit (round 5)

**Date:** June 2025  
**Overall score: ~88 / 100** (up from ~85 after gentle alarm flow + adaptive theme)  
**Vision-aligned product: ~78 / 100** (up from ~68; core alarm UX now matches vision)

See [ROADMAP.md](ROADMAP.md) for what to build next.

---

## Score by area

| Area | Score | Δ vs R4 | Summary |
|------|------:|---------|---------|
| **Product vision & UX** | 78 | +18 | Gentle alarm flow shipped (learn → one MCQ → dismiss) on web and mobile. Word Gym tab still missing. |
| **Mobile app** | 89 | +3 | Nine routes including `/learn` and `/morning-task`; adaptive theme on alarm flow; calendar Gym deep link fixed. |
| **Web prototype** | 88 | +4 | Alarm path uses `fetchAlarmWords` + morning task UI; gradual light/dark theme over 30 minutes. |
| **Content & words** | 96 | 0 | **395 words** (A–Z), morning tasks validated, Supabase synced. |
| **Backend & data** | 93 | 0 | Unchanged; auth and cloud progress still unwired. |
| **Monetisation** | 26 | 0 | All words free; Gold is calendar UI preview only. |
| **Launch readiness** | 68 | +3 | Core product loop matches vision; P1 #9 device sign-off still open. |
| **Documentation & ops** | 82 | +14 | README, ROADMAP, and this audit refreshed to match shipped features. |

**Weighted overall: ~88/100**

**Vision-aligned product score: ~78/100**

---

## What improved since round 4 (~85)

### Shipped and real

- **Gentle alarm flow** on mobile: `/alarm` → `/learn` → `/morning-task` → `/success`
- **Web parity:** learn screen, morning task MCQ, `fetchAlarmWords`, distractor pool via Supabase
- **Gradual adaptive theme:** 30-minute dusk (20:30–21:00) and dawn (5:30–6:00) transitions on web and mobile alarm screens
- **Word Gym split:** alarm uses `ZazuAlarmWord`; puzzle uses `gymSessionWord` + `completeGym()` from calendar
- **Calendar fix:** “Open in Word Gym” calls `startGymFlow()` before `/puzzle`
- **Shared libs:** `lib/adaptive-theme.ts`, `lib/morning-task.js`, mobile `ThemeProvider`

### Still open

- Word Gym tab or home entry point (P2b #24)
- Gym completion success screen and calendar `gymCompleted` sync from local progress
- Full adaptive theme on home and calendar (alarm flow only today)
- Auth, IAP, P1 #9 device verification

---

## Critical gaps (ordered by impact)

### 1. Word Gym as a product surface

`get_words_for_gym`, `completeGym()`, and calendar deep link work. No dedicated Gym tab, no gym success recap, calendar may not reflect gym completion from local progress yet.

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
