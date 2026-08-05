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

- **Alarm flow:** scheduled local notification → reveal word of the day (definition, pronunciation, etymology) → one morning task (multiple-choice question) → dismiss. Completing it correctly (and without a hint) affects streak/coin rewards.
- **Word Gym:** an optional deeper-practice mode — a 3-round word-matching puzzle — reachable from the calendar or a dedicated tab.
- **Calendar/history:** past words are grouped by month; free users can open today and yesterday, everything older is locked behind Zazu Gold.
- **Gamification:** day-streak counter and coins earned each morning, shown on the home screen header.
- **Accounts:** Supabase-backed auth (Apple/Google sign-in) with a guest/anonymous mode that doesn't require signing in to use the core alarm loop.

## Capabilities and Constraints

- **Content:** a curated word library (currently 395 words), each with a definition, pronunciation, part of speech, etymology, and a morning-task question; validated and seeded via a Supabase pipeline with CI checks.
- **Monetization:** Zazu Gold subscription via RevenueCat in-app purchase (App Store / Play Store), unlocking full calendar history and Word Gym. Free tier gets today + yesterday only.
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

## Accessibility & Inclusion

No product-specific accessibility requirement has been established with the user beyond the existing keyboard/ARIA support on the web puzzle (see Capabilities and Constraints). Treat as an open decision rather than inventing a standard.
