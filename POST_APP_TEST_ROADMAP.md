# Zazu — Post App-Test Roadmap (2026-08-09)

Findings from the first real on-device test of a working Zazu Dev build (after resolving the `expo-av`/`LazyKType` native crash and the `expo-audio` playback-cutoff bug in the same session). Captured live from the user's phone, not carried forward from prior docs.

---

## Priority overview

| # | Item | Type | Needs native rebuild? | Status |
|---|------|------|------|------|
| 1 | Full-screen alarm intent (`notifee` migration) | Architecture | **Yes** | Open |
| 2 | Morning alarm UX flow — drag-and-drop spelling dismissal | UX design | No | Open (depends on #3) |
| 3 | Word of the Day logic (per-alarm → per-day) | Logic / data model | No | Open |
| 4 | Snooze duration slider | UI + logic | No | **Done** |
| 5 | Word Gym card spacing / dot position | UI polish | No | **Done** |
| 6 | Typography & readability (serif, size) | Design tokens | No | **Partly done** — sizes bumped; typeface swap still open |
| 7 | Z logo visual bug (light mode stray line) | Bug fix | No | **Done** |
| 8 | Word Gym / Duolingo alignment | Product design | No | Open |
| 9 | Word-bank Usage-pair capitalization (found post-launch, not in original list) | Content bug | No | **Done** |

Only #1 touches native code. Remaining open items (#1, #2, #3, #8) are pure JS/UI/logic apart from #1 — worth batching #2 and #3 together next (in that order, since #2 depends on #3), and treating #1 as its own focused session given how build-cycle-heavy native work proved to be tonight.

---

## 1. Full-Screen Alarm Intent — High priority / architecture

`expo-notifications` cannot reliably wake a killed phone over the lock screen — it has no support for Android's full-screen-intent notification type (confirmed: zero trace of it anywhere in the package's native source or JS API). Current behavior: a standard notification + vibration fires, but the alarm screen only opens if the user taps it — not acceptable for an alarm clock.

**Plan:** migrate the alarm-triggering layer from `expo-notifications` to `@notifee/react-native`, which has full-screen-intent, wake-screen, alarm-style notifications built in (purpose-built for this exact use case, with an Expo config plugin). Rejected alternative: hand-rolling a native module + `AlarmManager` + `BroadcastReceiver` + Activity flags — higher risk of subtle bugs across OEM battery-optimization behavior (Samsung/Xiaomi etc.) for no real benefit over an established library.

Scope: rewrite of `lib/alarm-notifications.ts` scheduling logic and the `NotificationBootstrap.tsx` listener, new native permission (`USE_FULL_SCREEN_INTENT`), new config plugin, several EAS build cycles to verify on-device.

---

## 2. Morning Alarm UX Flow — Drag-and-Drop Spelling Dismissal

Current flow goes straight from asleep → hard multiple-choice question, which is too jarring for a groggy brain. Decided direction: replace the MCQ (`MorningTaskScreen.tsx`) with a low-cognitive-load drag-and-drop letter-spelling puzzle — the alarm screen shows the Word of the Day, and the user drags letters from a letter bank (word's letters plus a few decoy letters) into place to spell it and dismiss the alarm. Lower cognitive load than an MCQ while still requiring genuine engagement (can't be dismissed by mashing a random option), and ties the dismissal action directly to the Word of the Day rather than an arbitrary quiz question.

Depends on #3 (Word of the Day needs to be a single per-day value, not per-alarm, before it makes sense as *the* word the dismissal puzzle is built around).

---

## 3. Word of the Day Logic

Word selection currently happens per-alarm-firing rather than per-day, so multiple enabled alarms each roll their own word instead of sharing one. Needs to become genuinely date-keyed so "Word of the Day" means the day, not the specific alarm instance.

---

## 4. Snooze Slider — Done

Replaced the fixed 8-minute snooze with a draggable slider, range **1–20 minutes** (researched against iOS/Android defaults, Alarmy, Sleep Cycle, and sleep-fragmentation research — see session notes; landed under 30 to stay consistent with Zazu's "gentle, not enabling" snooze design rather than matching the more permissive apps that go to 45-60), defaulting to 8 (the old fixed value). Built with React Native's built-in `PanResponder` (`SnoozeSlider.tsx`) rather than a native slider library, so no EAS build was needed. The `"one per day"` / `"no bonus if snoozed"` rules are untouched — they apply regardless of the chosen duration.

Known scope cut: the slider resets to the 8-minute default every time the alarm fires rather than remembering the last value picked — no persistence was added. Easy follow-up if wanted.

---

## 5. Word Gym UI — Done

Doubled the gap between mode-selection cards (`GymModeCard.tsx`, 8px → 16px). Moved the Literary Round's progress dots (`GymLiteraryRoundScreen.tsx`) from a mid-page spot sandwiched between the quote card and the answer options, up to sit directly under the "Round X of Y" title — consolidates both progress indicators into one place instead of two disconnected ones.

---

## 6. Typography & Readability — Partly done

**Done:** bumped ~25 text styles in `constants/theme.ts` (body copy, labels, buttons, meta text) by roughly a notch each, with matching line-height increases. Left the big display headings (word hero, alarm time, success heading) untouched since those weren't reported as too small.

**Still open:** the "too fancy" complaint is about the `DM Serif Display` typeface itself (used for the Word of the Day text, alarm time, headings), not size — none of the small/body text actually uses the serif face, only big showcase text does. Discussed options: **DM Serif Text** (the same type family's reading-optimized sibling cut — lowest-risk, same brand DNA) was the recommendation, vs. Lora / Fraunces / Newsreader as further-afield alternatives. Not yet implemented — needs the user to see DM Serif Text in place before deciding whether it's enough or a bigger typeface change is wanted.

---

## 7. Z Logo Visual Bug — Done

Root cause wasn't SVG (the mark is actually a raster PNG, `assets/images/zazu-mark.png`, used in `AlarmScreen.tsx`, `HomeHeader.tsx`, and `SuccessScreen.tsx`) — found via a pixel-data scan: a single pixel-wide stray column at x=642 (out of 648px width), a dark muddy duplicate of the real right edge sitting 1px outside it, running almost the full image height. Fixed by copying the correct edge column over it and verifying zero dark pixels remain in that column. Since it's one shared asset, the fix covers the logo everywhere it appears.

---

## 8. Word Gym / Duolingo Alignment

Look into aligning Word Gym's gameplay and structure much more closely with how Duolingo works, for better engagement and progression loops. Currently unscoped — needs a proper look at what Duolingo actually does mechanically (streaks, XP/leveling, lesson-unit structure, hearts/lives, skill trees) versus what Word Gym already has (spaced-repetition modes, review queue, roots drill, usage lab), and a decision on which mechanics are worth adopting versus which would fight Zazu's own identity as an alarm-first app rather than a standalone learning app.

---

## 9. Word-Bank Usage-Pair Capitalization — Done

Found during testing, not on the original list: in the Word Gym "Usage" round (match a sentence fragment to its completion), every completion (`side_b`) was capitalized when it should continue the sentence in lowercase — 100% of entries affected (1,000 live rows in Supabase's `word_pairs` table, 1,580 in the local `zazu-words.json` staging file). Fixed with a targeted script: lowercase the first letter only, scoped specifically to rounds where `word_rounds.type = 'Usage'` (the Etymology/Definition round types were left untouched since their `side_b` values are standalone labels, not sentence continuations). Applied directly to Supabase (verified 0 remaining afterward) and to the local staging file for future reseeds.
