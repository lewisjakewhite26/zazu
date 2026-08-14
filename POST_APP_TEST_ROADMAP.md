# Zazu — Post App-Test Roadmap (2026-08-09)

Findings from the first real on-device test of a working Zazu Dev build (after resolving the `expo-av`/`LazyKType` native crash and the `expo-audio` playback-cutoff bug in the same session). Captured live from the user's phone, not carried forward from prior docs.

---

## Priority overview

| # | Item | Type | Needs native rebuild? | Status |
|---|------|------|------|------|
| 1 | Full-screen alarm intent (`notifee` migration) | Architecture | **Yes** | Open |
| 2 | Morning alarm UX flow — drag-and-drop spelling dismissal | UX design | No | Open (unblocked, #3 is done) |
| 3 | Word of the Day logic (per-alarm → per-day) | Logic / data model | No | **Done** |
| 4 | Snooze duration slider | UI + logic | No | **Done** |
| 5 | Word Gym card spacing / dot position | UI polish | No | **Done** |
| 6 | Typography & readability (serif, size) | Design tokens | No | **Done** |
| 7 | Z logo visual bug (light mode stray line) | Bug fix | No | **Done** |
| 8 | Word Gym / Duolingo alignment | Product design | No | Partly scoped — packs structure decided, see `ROADMAP.md` |
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

## 3. Word of the Day Logic — Done

Turned out to be two separate bugs, both fixed, and the fix had to cover more ground than just the mobile app:

1. **Timezone bug**: the day-index was computed as `Math.floor(Date.now() / 86400000)` — UTC epoch days, not the user's local calendar day. Near midnight in non-UTC zones this flips to the "wrong" day (e.g. Sydney, UTC+10, would roll over at 10am local instead of midnight). Fixed with a new shared `lib/date-utils.ts` (`toLocalDateKey()` + `dateKeyToDayIndex()`) that derives the index from the device's actual local Y/M/D, not from `Date.now()`.
2. **Inconsistent pools bug** — the real cause of "multiple alarms, multiple words": the word-of-day pool was filtered to exclude already-learned words (`pickNextAlarmWord(words, learnedIds)`), and **5 different screens called this with inconsistent arguments** — `HomeScreen.tsx`/`CalendarScreen.tsx`/`GymScreen.tsx` passed the user's real learned-word IDs, while `NotificationBootstrap.tsx` (the actual alarm-firing path) and `WordDetailSheet.tsx` hardcoded an empty array. Different filtered pool → `dayIndex % pool.length` lands on a different word, even on the same date. Fixed by making Word of the Day fully global per the spec (every user, same word, same day) — dropped the learned-filtering from word-of-day selection entirely, and removed the now-dead `learnedWordIds` parameter from `useWordLibrary()` and all 5 call sites.

Also found and fixed the same two bugs in three more places that mirror this logic: `lib/calendar-utils.ts` (the Calendar tab's per-day word lookup — had its own independent, differently-broken UTC calculation, so the Calendar could already disagree with the live alarm word even before this fix), plus their web-prototype mirrors `lib/words-api.js` and `lib/calendar-web.js`. Added `tests/word-of-day.test.ts` covering the timezone-boundary cases specifically (a `Date` at 23:30 local vs. just after local midnight).

---

## 4. Snooze Slider — Done

Replaced the fixed 8-minute snooze with a draggable slider, range **1–20 minutes** (researched against iOS/Android defaults, Alarmy, Sleep Cycle, and sleep-fragmentation research — see session notes; landed under 30 to stay consistent with Zazu's "gentle, not enabling" snooze design rather than matching the more permissive apps that go to 45-60), defaulting to 8 (the old fixed value). Built with React Native's built-in `PanResponder` (`SnoozeSlider.tsx`) rather than a native slider library, so no EAS build was needed. The `"one per day"` / `"no bonus if snoozed"` rules are untouched — they apply regardless of the chosen duration.

Known scope cut: the slider resets to the 8-minute default every time the alarm fires rather than remembering the last value picked — no persistence was added. Easy follow-up if wanted.

---

## 5. Word Gym UI — Done

Doubled the gap between mode-selection cards (`GymModeCard.tsx`, 8px → 16px). Moved the Literary Round's progress dots (`GymLiteraryRoundScreen.tsx`) from a mid-page spot sandwiched between the quote card and the answer options, up to sit directly under the "Round X of Y" title — consolidates both progress indicators into one place instead of two disconnected ones.

---

## 6. Typography & Readability — Done

Bumped ~25 text styles in `constants/theme.ts` (body copy, labels, buttons, meta text) by roughly a notch each, with matching line-height increases. Left the big display headings (word hero, alarm time, success heading) untouched since those weren't reported as too small.

Swapped the serif typeface from `DM Serif Display` to **`DM Serif Text`** — the same type family's reading-optimized sibling cut (Display cuts are drawn for large decorative use with high-contrast quirky details; Text cuts are drawn to stay legible at reading sizes). Same brand DNA, addresses the "too fancy" complaint without a random typeface change. Updated the font load in `app/_layout.tsx`, the `fonts.serif` token in `theme.ts`, and two spots in `calendarStyles.ts` that referenced the old font name directly instead of going through the shared token. Uninstalled the now-unused `@expo-google-fonts/dm-serif-display` package. Fonts are loaded as data assets rather than native code, so this didn't need an EAS build either.

---

## 7. Z Logo Visual Bug — Done

Root cause wasn't SVG (the mark is actually a raster PNG, `assets/images/zazu-mark.png`, used in `AlarmScreen.tsx`, `HomeHeader.tsx`, and `SuccessScreen.tsx`) — found via a pixel-data scan: a single pixel-wide stray column at x=642 (out of 648px width), a dark muddy duplicate of the real right edge sitting 1px outside it, running almost the full image height. Fixed by copying the correct edge column over it and verifying zero dark pixels remain in that column. Since it's one shared asset, the fix covers the logo everywhere it appears.

---

## 8. Word Gym / Duolingo Alignment — Partly scoped 2026-08-09

The Duolingo-style piece of this is now decided: **Thematic Word Packs** as 30-day mini-campaigns with spaced retrieval, completion badges, and a coin/all-access-pass unlock — full spec in `ROADMAP.md` under "Coin Economy & Thematic Word Packs (#16, #17)". That answers the "lesson-unit structure" and "progression loop" half of this item directly.

Still open: whether any *other* Duolingo mechanics (hearts/lives, skill trees, XP/leveling as a concept separate from coins) are worth adopting for the base Word Gym experience (review queue, roots drill, usage lab) outside the new thematic packs specifically.

**⚠️ User caution (2026-08-09):** the user explicitly flagged that the Duolingo-aligned Word Gym work "needs real careful thought" and called it a big, important job — not something to rush into on the strength of tonight's quick-win momentum. Treat this as its own dedicated, deliberate session (design-first, like the notifee migration in #1), not a batched follow-on task. Don't start building against the spec in `ROADMAP.md` without a proper design pass first.

---

## 9. Word-Bank Usage-Pair Capitalization — Done

Found during testing, not on the original list: in the Word Gym "Usage" round (match a sentence fragment to its completion), every completion (`side_b`) was capitalized when it should continue the sentence in lowercase — 100% of entries affected (1,000 live rows in Supabase's `word_pairs` table, 1,580 in the local `zazu-words.json` staging file). Fixed with a targeted script: lowercase the first letter only, scoped specifically to rounds where `word_rounds.type = 'Usage'` (the Etymology/Definition round types were left untouched since their `side_b` values are standalone labels, not sentence continuations). Applied directly to Supabase (verified 0 remaining afterward) and to the local staging file for future reseeds.
