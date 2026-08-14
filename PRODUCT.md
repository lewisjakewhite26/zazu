# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Built with Expo/React Native for iOS and Android app store distribution (see `mobile/BUILD.md`, `mobile/eas.json`). Design is intentionally uniform across iOS and Android — Zazu does not fork its visual language per OS convention (no Material-vs-Human-Interface split); "adaptive" here records "genuine native app on both OSes," not per-platform visual adaptation. A separate hand-built static web prototype (`index.html`, deployed via Vercel) deliberately mirrors the mobile app's design tokens as a companion surface, not an independent design authority — the mobile app is primary. The real alarm mechanism (scheduled local notifications) only works natively; web cannot do scheduled wake-up alarms (confirmed limitation, see `ROADMAP.md`).

## Users

Vocabulary learners who want a gentler wake-up: people who already want to build their vocabulary and like the idea of folding that into the very first thing they do each morning, rather than remembering to open a separate word-of-the-day app or language app as a distinct habit.

## Product Purpose

Zazu is a morning alarm that is also a vocabulary lesson. It exists to make daily vocabulary-building effortless by attaching it to something the user already does every day without fail — waking up — rather than competing for attention as a standalone habit that's easy to skip.

## Positioning

The alarm *is* the lesson. Unlike a word-of-the-day app (passive, easy to ignore or dismiss unread) or a plain alarm clock (no content, purely functional), Zazu's alarm cannot be dismissed without engaging with today's word and completing a short task about it. The mechanism forces the ritual instead of hoping the user opens a separate app.

## Operating Context

- **Alarm flow:** scheduled local notification → reveal Word of the Day (definition, pronunciation, etymology) → one morning task → dismiss. **Word of the Day is global and unified**: every user, free or paid, gets the exact same word on any given calendar day, computed from the device's local `YYYY-MM-DD` (not UTC) so timezones resolve correctly without a server cron — no per-user rerolls, no competing words across a user's own multiple alarms. (Implemented — see `lib/date-utils.ts`, `POST_APP_TEST_ROADMAP.md` #3.) The morning task itself is planned to move from multiple-choice to a drag-and-drop letter-spelling puzzle of the Word of the Day (`POST_APP_TEST_ROADMAP.md` #2, not yet built).
- **Word Gym:** an optional deeper-practice mode — a 3-round word-matching puzzle on already-seen words, plus spaced-repetition modes (review queue, roots drill, usage lab) — reachable from the calendar or a dedicated tab. **Thematic Word Packs** (see Monetization below) live here too, as a separate, opt-in track from the daily alarm word.
- **Calendar/history:** past words are grouped by month; free users can open today and yesterday, everything older is locked behind Zazu Gold.
- **Gamification / earned currency:** day-streak counter and coins earned each morning, shown on the home screen header — the existing mechanic, evolving into a real spendable currency (see Monetization) rather than just a displayed number. Earned through positive daily habits: completing the morning alarm/puzzle, avoiding snoozes, keeping streaks alive, completing Word Gym sessions.
- **Accounts:** Supabase-backed auth (Apple/Google sign-in) with a guest/anonymous mode that doesn't require signing in to use the core alarm loop.

## Capabilities and Constraints

- **Content:** a curated word library (currently 395 words), each with a definition, pronunciation, part of speech, etymology, and a morning-task question; validated and seeded via a Supabase pipeline with CI checks. Separately, thousands of curated thematic words (Science, Food, Geography, Games, Loan Words, etc. — several packs already drafted in `THEMATIC PACKS/`) are planned as **Thematic Word Packs**: 30-day mini-campaigns inside Word Gym with built-in spaced retrieval, distinct from the single daily alarm word. Users pick a pack, progress through daily levels, and earn a completion badge + bonus coins at the end of 30 days.
- **Monetization — two tracks:**
  1. **Subscription (existing):** Zazu Gold subscription via RevenueCat in-app purchase (App Store / Play Store), unlocking full calendar history and Word Gym. Free tier gets today + yesterday only.
  2. **Earned coins + optional ads (new, planned):** users earn coins through daily habits (completing the alarm/puzzle, avoiding snoozes, streaks, Word Gym sessions), or optionally by watching rewarded video ads, capped at ~3/day, for users who want to progress faster. No static/banner ads anywhere, and no forced ads on the snooze flow. Thematic Word Pack full access (past the free preview) is unlocked either by spending earned coins or via an all-access pass — coins/pass are an unlock mechanism layered on top of the Gold subscription, not a replacement for it.
- **Backend:** Supabase (Postgres + row-level security gating premium content on Gold entitlement; an edge function handles the RevenueCat webhook).
- **Web accessibility:** the web puzzle has keyboard and ARIA support; no formal accessibility standard (e.g. WCAG level) has been confirmed as a product commitment — treat as undecided rather than assumed.

## Brand Commitments

- Product name: **Zazu**.
- Copy voice and writing rules are documented separately in `writing-rules.md` — consult it for any new user-facing text rather than inventing tone.

## Evidence on Hand

- Real, validated content: 395 words with full definitions/etymology/morning tasks, live in the Supabase content pipeline.
- No testimonials, case studies, press mentions, or usage benchmarks exist yet (pre-launch) — do not fabricate any.

## Product Principles

1. The alarm is the delivery mechanism for the lesson, not a separate feature bolted onto a learning app — never design the two as independent flows.
2. The ritual should feel calm and rewarding, not like a quiz or a chore blocking the user from turning off their alarm.
3. Free tier must remain genuinely useful on its own (full daily alarm ritual, today + yesterday history) — Gold is about depth (full history, Word Gym), not gating the core loop.
4. Mobile is the primary, trustworthy surface; the web prototype exists to mirror it, not to diverge from it.
5. Ads are strictly opt-in (rewarded video the user chooses to watch, capped per day) — never a static/banner ad, and never inserted into the core alarm/snooze flow.
6. The daily alarm word is a single shared ritual, not a personalization surface — Thematic Word Packs (Gym-only, optional, unlockable) are where variety and choice live, so the core morning loop stays universal.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established with the user beyond the existing keyboard/ARIA support on the web puzzle (see Capabilities and Constraints). Treat as an open decision rather than inventing a standard.
