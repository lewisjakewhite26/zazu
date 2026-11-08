# Zazu product audit (round 10)

**Date:** 2026-08-27
**Overall score: ~87 / 100** (up from ~78 in round 9)
**Vision-aligned product: ~82 / 100** (up from ~70 in round 9)

See [ROADMAP.md](ROADMAP.md) for what to build next. Design tokens: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

**This round folds in and retires `auditlateaugst.md`.** That file was a separate, parallel audit created 2026-08-26 with its own rubric and its own scoring, sitting alongside this one for a month with neither referencing the other — round 9's own "Documentation & ops" finding warned about exactly this failure mode (docs that contradict each other or go stale in isolation), and it happened again anyway. Its verified findings (RLS, contrast, dead code, `@ts-nocheck` removal, `WordLibraryContext`, account deletion, purchase-flow fix, Google Sign-In hardening) are folded into the round below and it has been deleted — this file is the one audit doc going forward.

---

## Why the score moved since round 9

Round 9 (2026-07-31) found a live RLS gap, two dead-end screens, and no test suite. `auditlateaugst.md` (2026-08-26) independently re-verified against code and found all of that fixed, plus resolved three fresh production blockers (no account deletion, a purchase flow that showed a paying user an error, and a Google Sign-In crash risk with zero fallback). Since that pass, this session added:

- **Google Sign-In rewritten from the ground up**, not just hardened. The previous fix (2026-08-26) made the `expo-auth-session` browser-redirect flow fail safely instead of crashing — but that whole approach turned out to be broken by Google's own policy change (custom URI scheme redirects are no longer supported for Android). Replaced entirely with `@react-native-google-signin/google-signin` (native Credential Manager on Android, no redirect URI involved at all). Typechecks and builds clean; **still needs a real device rebuild** (`expo run:android --variant release`) to confirm on-device — this is a new native dependency, not a JS-only change.
- **Paywall copy fixed properly.** Round 9/`auditlateaugst.md` both flagged the Gold paywall copy as thin. The feature bullets were fixed 2026-08-26; the headline and subtitle were still a feature list ("Ten themed word packs. Full history. Every Word Gym mode.") until this session, rewritten to lead with the actual benefit ("Never lose a word again" / "Everything you learn stays yours. Go deeper whenever you want.").
- **The legacy static web prototype is gone entirely** (2026-08-26, `d21b8c6`), replaced by `landing/` (the `zazulanding` project, merged in). This round scores it fresh under **Landing page** below, replacing round 9's "Web prototype" row.
- **Question/round phrasing now varies.** Every one of the 393 free words and every theme pack used the exact same fixed sentence per round type, verbatim, forever. `lib/question-variety.ts` now rotates through a 12-line hand-written pool per round type, picked deterministically per word — verified for even distribution across all 393 words and confirmed live on the actual puzzle screen.
- **Content bug fixed**: "Languid"'s root answer was truncated (`"To droop, fade, or slug"`). It now reads "To droop, fade, or grow sluggish" everywhere. An automated scan of all 122,000+ content strings (2026-11-08) for cut-off final words, unbalanced tags and empty fields found no other truncations.
- **Two of round 9's own launch blockers are now stale as concerns**: `git remote -v` now shows a real GitHub remote (`lewisjakewhite26/zazu`) — the "no remote configured" finding no longer applies. `mobile/.env` exists with RevenueCat keys set — the "RevenueCat unconfigured" finding is also stale (`auditlateaugst.md` independently confirmed the dashboard config matches the code).
- **iOS is confirmed dead, not just unbuilt.** The user has stated there is no iOS app and there won't be one. This isn't a gap to close — it changes what several other findings mean (see Monetisation and Launch readiness below), and it surfaced a real accuracy problem: the landing page and legal pages both referenced Apple App Store billing and iOS download links until this session, which for a UK legal document is a factual-accuracy issue, not just stale marketing copy. Fixed. `mobile/services/auth.ts` still has a working Apple Sign-In code path gated to iOS-only (`isAppleSignInAvailable()`), which can now never trigger — flagged, not removed yet.

---

## Score by area

| Area | Score | Δ vs R9 | Summary |
|------|------:|---------|---------|
| **Product vision & UX** | 90 | +2 | Core loop unchanged and strong. Question/round phrasing no longer repeats verbatim across every word — a real ritual-quality fix, not cosmetic. Word Gym's round-progress dots and free-tier empty-state spacing also fixed this session. |
| **Mobile app** | 94 | +4 | `tsc --noEmit` (real typecheck config) passes clean, 110 root + 9 mobile tests passing (was 0 in R9), blanket `@ts-nocheck` removed from 7 core `lib/` files, `WordLibraryContext` closes the 7-component duplicate-fetch bug, account deletion is real and deployed, purchase flow no longer shows an error on a successful charge, Google Sign-In rewritten onto a native, policy-compliant mechanism. Held back by: mobile UI test count (9) still thin against ~51 component files, and the Google Sign-In rewrite hasn't had its on-device rebuild yet. |
| **Landing page** *(replaces "Web prototype")* | 85 | n/a | New scoring row — the legacy prototype this replaced is deleted. Full redesign this session: pulled back from 5 competing full-bleed saturated gradients to one signature hero moment (matches current design-research consensus on restraint over saturation), copy rewritten from feature-lists to benefit-led positioning, fonts corrected to genuinely match the app (DM Sans) or deliberately diverge with reason (Boska over DM Serif Text at display scale, tested and reverted), a real favicon/logo built from the actual brand mark (was the Next.js default), all iOS/App Store references removed including from the legal pages. `next build` and typecheck clean throughout. Held back by: no live Lighthouse/perf pass, no Open Graph image for social share previews, unknown deploy/live-URL status (not verifiable from code). |
| **Content & words** | 90 | −2 | 393 free words + 1,741 pack words, content itself (etymology, quotes, definitions) genuinely well-crafted on spot-check. Down slightly from R9's 92: a real truncation bug was found ("Languid") that R9 didn't catch, and it was only a ~15-word spot check — unknown how many others exist across 2,100+ entries. Question-phrasing repetition (the bigger issue) is now fixed. |
| **Backend & data** | 90 | +2 | RLS unchanged and already correct per `auditlateaugst.md`'s independent re-check (the `word_roots`/`word_morning_tasks` gap R9 found was closed same-day). Account deletion is now a real, deployed Edge Function (smoke-tested: 401 on an unauthenticated call), not just a UI mockup. Not yet run end-to-end by an actual user. |
| **Monetisation** | 76 | +18 | R9 scored this 58 primarily because RevenueCat was unconfigured — it now is (`.env` keys set, dashboard config independently verified against the code). Purchase-flow bug (showed an error on a successful charge) is fixed. A sharing hook exists (`SuccessScreen`'s share button — R9 never checked for this). Paywall copy is now benefit-led, not a feature list. Since iOS is confirmed dead, "no Apple Store app configured" is no longer a gap to close — Google Play is the only real target, which simplifies rather than blocks this. Held back by: no live purchase has been confirmed end-to-end, and whether a real Play Store listing exists isn't verifiable from code. |
| **Launch readiness** | 82 | +6 | The git-remote gap is closed (a real GitHub remote exists). Device verification has been happening via local builds (`expo run:android --variant release`) rather than EAS, per the session logs — the EAS-specific backlog items in `ROADMAP.md` describing this as "not started" are stale and have been corrected this round. iOS is out of scope by decision, not a gap. Held back by: tonight's Google Sign-In rewrite needs its own fresh device rebuild before it's confirmed working, and no live purchase has been run end-to-end. |
| **Documentation & ops** | 78 | +12 | This is the round that actually did the consolidation R9 called for and R8→R9 needed: `auditlateaugst.md` (a full parallel audit that disagreed with this file for a month) has been merged in and deleted; `ROADMAP.md`'s EAS dev-build backlog (which contradicted its own later note that this path was superseded) has been corrected; the stale Google Sign-In roadmap line has been updated to reflect the full rewrite. Not scored higher because this exact failure mode — parallel docs going stale in isolation — has now happened at least twice on this project; the fix needs to hold, not just have happened again. |

**Weighted overall: ~87/100**

**Vision-aligned product score: ~82/100**

---

## Critical gaps (ordered by impact)

1. **Google Sign-In's native rewrite hasn't been run on a real device yet.** Code-complete, typechecks and builds clean, but it's a new native dependency (`@react-native-google-signin/google-signin`) — needs `expo run:android --variant release` and an actual sign-in attempt before this is truly closed.
2. **No purchase has been confirmed end-to-end.** The purchase-flow bug is fixed and the RevenueCat dashboard config is verified correct, but nobody has actually completed a real (or sandbox) purchase since the fix landed.
3. **Account deletion hasn't been run end-to-end either.** Same shape of gap — the Edge Function is deployed and smoke-tested, but no real user has deleted a real account through it yet.
4. **A live screen-reader pass (VoiceOver/TalkBack) still hasn't happened.** Static `accessibilityRole`/`Label`/`State` coverage is decent (35/51 files per the last count) but unverified in actual use.
5. **A real on-device layout confirmation sweep is still open.** Every visual finding across every audit round so far has come from the Expo-web build. Nothing has been confirmed against actual native rendering (safe areas, gesture conflicts, real keyboard behavior).
6. ~~**The "Languid" content truncation bug.**~~ Fixed. A full automated scan on 2026-11-08 found no others.
7. **Real Play Store listing status is unknown.** Can't be verified from code — worth confirming directly rather than assuming.

---

## What is genuinely strong

- **The core loop is fully built, typesafe, and now actually tested**: 110 root tests (webhook signature, RLS structure, gym-mode logic, snooze math, literary-word question building) + 9 mobile tests, `tsc --noEmit` passing clean on the real typecheck config.
- **Real auth, real notifications, real monetisation code** — Supabase session state machine, `expo-notifications` scheduling, RevenueCat SDK fully wired (configure/offerings/purchase/restore) with correct HMAC webhook verification, and RLS gating every premium table correctly.
- **Account deletion and the purchase-flow bug — both real production blockers a month ago — are genuinely fixed and independently re-verified**, not just claimed.
- **The landing page is a real, cohesive, benefit-led marketing surface** built from the app's own brand assets (the real Z mark, mostly-matching fonts), not a placeholder.
- **The daily ritual no longer repeats itself verbatim** — a subtle but real product-quality fix that a templated quiz app wouldn't normally bother making.

---

## Top 4 fixes next (by impact)

1. **Rebuild and test the native Google Sign-In swap on a real device.** This is the single biggest "code says done, device hasn't confirmed it" gap right now.
2. **Run one real end-to-end purchase and one real end-to-end account deletion.** Both are code-verified but neither has actually happened.
3. **A live screen-reader pass + on-device layout sweep**, ideally in the same session since both need the same physical device time.
4. **A fuller content-QA pass** beyond the "Languid" spot-check, given the question-phrasing fix just made the ritual's quality a much more visible selling point than it was a week ago.

After (1)–(2), realistic path to **~92+ overall / ~88+ vision**.

---

## Revenue estimate (monthly, GBP)

**Current realistic monthly revenue: £0.** RevenueCat is configured and the purchase code is verified correct, but no purchase has been run end-to-end yet and the actual Play Store listing status is unknown from code. Once a real purchase is confirmed and a live store listing exists, revenue becomes a function of install volume and trial→paid conversion — not re-estimated here until distribution is confirmed live.

---

## Audit history

| Round | Date | Overall | Vision | Notes |
|-------|------|---------|--------|-------|
| 1 | Early build | ~58 | — | Single-file prototype |
| 5 | Gentle alarm + theme | ~88 | ~78 | P2b alarm flow |
| 6 | Home UI prototype | ~89 | ~80 | Home matches index.html |
| 7 | Full mobile UI + P1 polish | ~91 | ~83 | All mobile screens aligned |
| 8 | Web parity + PWA | ~93 | ~85 | Calendar, settings, gym, alarms, install (scores not independently re-verified against code) |
| 9 | Ground-truth re-audit | ~78 | ~70 | Re-verified every claim against code; found paywall RLS gap + unreachable mobile screens; monetisation code found far more complete than documented |
| 9.5 | `auditlateaugst.md` (2026-08-26, now merged into this file) | ~78 | — | Independently re-verified 3 fresh production blockers as resolved (account deletion, purchase-flow error, Google Sign-In crash risk), plus contrast, dead code, and architecture fixes. Native-only scope; the web prototype was excluded and later deleted. |
| 10 | This round | **~87** | **~82** | Folded in and retired `auditlateaugst.md`; Google Sign-In fully rewritten (not just hardened); paywall copy, question-phrasing repetition, and the landing page all addressed; `git remote`/RevenueCat-config findings confirmed stale; `ROADMAP.md`'s contradictory EAS section corrected. |

---

## Bottom line

**~87/100** as a build, content, and platform score. The jump from round 9's ~78 is real, not just re-scoring generosity: two production blockers that genuinely existed a month ago (no account deletion, a purchase flow that scared paying users) are fixed and independently verified, a broken auth mechanism was replaced rather than patched, and a subtle but real content-repetition problem was found and fixed. What's held back is consistent across rounds: nothing here has been confirmed on a real device yet in its current form — Google Sign-In's rewrite, a real purchase, a real account deletion, and screen-reader/layout behavior are all "code says this works" rather than "a phone confirmed this works."

**~82/100** as a shippable product matching the current vision (Android-only, now confirmed rather than assumed). The core loop is genuinely strong and well-tested. What stands between this and a real launch is now almost entirely device time, not more code: one rebuild, one real purchase, one real deletion, and a screen-reader pass.
