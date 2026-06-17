# Zazu Design System

**Single source of truth:** [`index.html`](index.html) (`:root` + `body.night` CSS variables).  
**Mobile implementation:** `mobile/constants/theme.ts`, `lib/adaptive-theme.ts`, `mobile/context/ThemeContext.tsx`, and UI primitives under `mobile/components/ui/`.

**Governance:** Prototype changes in `index.html` first → update `theme.ts` → update components → update this file.

---

## Prototype alignment status

| Screen / surface | Status | Reference |
|------------------|--------|-----------|
| **Home** (mobile) | **Done** — matches `index.html` light + dark | `New SS/home-light.png`, `New SS/home-dark.png` |
| Alarm, learn, morning task, success | Pending | Use home tokens; do not invent colours |
| Add alarm, calendar, Word Gym tab | Pending | Legacy palette / partial `useTheme()` |
| Settings, onboarding, Gold | Pending | Not yet aligned |
| Web (`index.html`) | Source of truth | — |

**Next milestone (ROADMAP P2 #36):** Finalise mobile UI for all remaining pages against `index.html`.

---

## Theme tokens (`mobile/constants/theme.ts`)

All values are extracted from `index.html`. Components must use `useTheme().colors` — never hardcode hex.

### Light palette (`:root`)

| Token | Value | Use |
|-------|-------|-----|
| `bgFrom` / `bgMid` / `bgTo` | `#fde8d8` / `#dde8f8` / `#ede0f8` | Page gradient |
| `text` / `subtext` | `#2c1f2e` / `#9080a0` | Body copy, labels |
| `ink` | `#2c1f2e` | Primary button fill (light) |
| `border` | `rgba(44,31,46,0.1)` | Card borders |
| `card` | `rgba(255,255,255,0.72)` | Glass card fill |
| `gold` | `#c9963a` | Etymology `<strong>`, coin accents |
| `blush` | `#f0a0bc` | Toggle track (on) |

### Dark palette (`body.night`)

| Token | Value |
|-------|-------|
| `bgFrom` / `bgMid` / `bgTo` | `#1a1225` / `#1a1830` / `#0e0c1a` |
| `text` / `subtext` | `#f0e8f8` / `#b0a0c8` |
| `border` | `rgba(255,255,255,0.13)` |
| `card` | `rgba(255,255,255,0.11)` |

### Static tokens (do not blend)

| Token | Use |
|-------|-----|
| `streakFlameStart/End` | Streak pill gradient |
| `coinGradientStart/End` | Coin chip gradient |
| `wotdGradientStart/End` (+ night variants) | Word-of-the-day hero |
| `posBadgeBg` (+ night) | Part-of-speech badge |
| `primaryButtonBgNight` | Add-alarm button (dark) |

### Layout tokens

| Token | Value | Source |
|-------|-------|--------|
| `backgroundGradientAngle` | 160° | `linear-gradient(160deg, …)` |
| `backgroundTransitionMs` | 2000 | Theme change animation |
| `cardBlurIntensity` | 10 | `.glass-card` blur |
| `radii.wotd` | 22 | `.wotd-hero` |
| `radii.alarmCard` | 18 | `.alarm-card` |

Typography scale (wordmark, WOTD word, section labels, etc.) lives in `theme.ts` → `typography`.

---

## Adaptive theme (`lib/adaptive-theme.ts`)

Matches `index.html` gradual light/dark behaviour:

- **Dusk:** 20:30–21:00 · **Dawn:** 5:30–6:00 · **Full dark:** 21:00–5:30
- **Eight blendable vars** lerp during transitions: `bgFrom`, `bgMid`, `bgTo`, `text`, `subtext`, `ink`, `border`, `card`
- **Night snap at blend ≥ 0.5:** WOTD gradient, POS badge, primary button colours switch to dark variants (same as `body.night` rules in HTML)

`ThemeProvider` (`mobile/context/ThemeContext.tsx`) merges the blended palette with static tokens from `theme.ts`.

---

## UI primitives (home-aligned)

| Component | File | Notes |
|-----------|------|-------|
| `GradientBackground` | `mobile/components/ui/GradientBackground.tsx` | 160° three-stop gradient, 2s ease on theme change |
| `GlassCard` | `mobile/components/ui/GlassCard.tsx` | `colors.card` + border + `expo-blur` (intensity 10) |
| `AnimatedToggle` | `mobile/components/ui/AnimatedToggle.tsx` | 44×26 track, 20px thumb — matches HTML toggle |
| `OriginText` | `mobile/components/ui/OriginText.tsx` | Etymology with `<strong>` in `colors.gold` |
| `PrimaryButton` | `mobile/components/ui/PrimaryButton.tsx` | Ink/white (light), translucent white (dark) |
| `DawnBackground` | `mobile/components/ui/DawnBackground.tsx` | Alias re-export of `GradientBackground` |

---

## Home screen composition

| Component | File |
|-----------|------|
| `HomeScreen` | `mobile/components/home/HomeScreen.tsx` |
| `HomeHeader` | `mobile/components/home/HomeHeader.tsx` |
| `WordOfDayCard` | `mobile/components/home/WordOfDayCard.tsx` |
| `AlarmCard` | `mobile/components/home/AlarmCard.tsx` |

Footer actions mirror `index.html`: **Add alarm**, **Try the alarm**, theme toggle.

---

## Screenshots

Capture script: `scripts/capture-new-ss.mjs` (Expo web on port 8083, `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1`).

Approved home screenshots: `New SS/home-light.png`, `New SS/home-dark.png`.

---

## Legacy screens (not yet migrated)

Alarm flow, calendar, gym tab, settings, onboarding, and Gold screens may still use older patterns (`contentText` hardcoded hex, calendar card tints, static backgrounds). When updating each screen, replace with `useTheme().colors` and the primitives above — extract exact values from the matching `index.html` section only.
