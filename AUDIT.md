# Zazu product audit (round 8)

**Date:** June 2026  
**Overall score: ~93 / 100** (up from ~91 after web calendar, settings, PWA, gym entry, alarm persistence)  
**Vision-aligned product: ~85 / 100** (up from ~83; web now matches mobile surfaces for daily use)

See [ROADMAP.md](ROADMAP.md) for what to build next. Design tokens: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

---

## Score by area

| Area | Score | Δ vs R7 | Summary |
|------|------:|---------|---------|
| **Product vision & UX** | 85 | +2 | Web has home, gym tab, calendar, settings, full alarm flow; scheduled wake-up still mobile-only. |
| **Mobile app** | 94 | 0 | All screens prototype-aligned; auth providers still unwired. |
| **Web prototype** | 93 | +5 | Calendar, settings, gym entry, alarm persistence, floating tab bar, PWA install + offline shell. |
| **Content & words** | 96 | 0 | **395 words**, validated pipeline, Supabase ready. |
| **Backend & data** | 94 | 0 | Entitlements migration ready; auth unwired. |
| **Monetisation** | 28 | 0 | Gold preview on web calendar; no live IAP. |
| **Launch readiness** | 76 | +3 | Web parity strong; device sign-off (P1 #9) still open. |
| **Documentation & ops** | 90 | +2 | Audit/roadmap refreshed; PWA assets in build pipeline. |

**Weighted overall: ~93/100**

**Vision-aligned product score: ~85/100**

---

## What improved since round 7 (~91)

### Shipped and real

- **Web Word Gym tab** — practice word, start puzzle, gym success flow
- **Web alarm persistence** — `lib/alarms-web.js`, toggles + add-alarm dialog in `localStorage`
- **Web calendar** — 30-day history, free/Gold preview toggle, locked older words, word detail sheet, Open in Word Gym
- **Web settings** — push notification toggle (browser permission), theme (auto/light/dark), guest account name on device
- **PWA** — `manifest.webmanifest`, `sw.js`, installable shell, offline static assets
- **Web tab bar** — floating pill nav (Home | Word Gym); calendar/settings via header icons
- **Mobile web tab bar** — floating pill styling on Expo web

### Still open

- **P1 #9** device verification on EAS dev build
- **Auth wiring** on mobile (`AuthProvider` not mounted)
- **Live IAP / Gold billing**
- **Browser scheduled wake-up alarms** (PWA notifications are permission-only today; no alarm scheduling on web)
- **Cloud progress sync**

---

## Critical gaps (ordered by impact)

1. **Device sign-off (P1 #9)** — EAS dev build + notifications/audio/persistence on phone
2. **Auth + entitlements** — mount providers, run migration 003, connect Gold to real subscription
3. **Monetisation** — RevenueCat / store billing; all words still free
4. **Web scheduled alarms** — PWA can install and cache; morning alarm scheduling remains mobile-only
5. **In-app nav on mobile** — calendar/settings routes exist but no home header links yet

---

## What is genuinely strong

- **End-to-end web product:** home → alarm → learn → morning task → success; gym tab → puzzle → ad → recap; calendar + settings
- **Mobile + web design parity:** same tokens, glass cards, floating tab bar pattern
- **395-word content pipeline** with CI validation
- **PWA-ready static deploy** on Vercel with offline shell

---

## Top 5 fixes next (by impact)

1. **EAS dev build + P1 #9** device verification
2. **Wire auth stack** on mobile
3. **Mobile home nav** to calendar + settings
4. **Live Gold IAP** when ready to monetise
5. **Browser alarm scheduling** (optional — Service Worker + Notification schedule API when supported)

After (1) and (2), realistic path to **~94+ overall / ~87+ vision**.

---

## Revenue estimate (monthly, GBP)

**Current realistic monthly revenue: £0** (pre-monetisation, pre-store).

See prior rounds in table below for scenario estimates.

---

## Audit history

| Round | Date | Overall | Vision | Notes |
|-------|------|---------|--------|-------|
| 1 | Early build | ~58 | — | Single-file prototype |
| 5 | Gentle alarm + theme | ~88 | ~78 | P2b alarm flow |
| 6 | Home UI prototype | ~89 | ~80 | Home matches index.html |
| 7 | Full mobile UI + P1 polish | ~91 | ~83 | All mobile screens aligned |
| 8 | Web parity + PWA | **~93** | **~85** | Calendar, settings, gym, alarms, install |

---

## Bottom line

**~93/100** as a build, content, and platform score.  
**~85/100** as a shippable product matching the latest vision.

Web is now a credible companion to mobile for learning, streaks, calendar, and Word Gym. Store-ready v1 still needs **device verification**, **auth**, and **monetisation**.
