# Zazu Mobile — UX/UI Critique, 2026-08-06

Full record of the pre-launch design critique run via `/impeccable critique`, the fixes applied in response, and the two re-critiques that verified them. Two independent dual-agent assessments (an unanchored design review + a mechanical detector/grep evidence pass) were run for each score, per the project's critique protocol. Raw snapshots also live in `.impeccable/critique/` (`2026-08-06T14-45-36Z__mobile.md`, `2026-08-06T15-12-35Z__mobile.md`, `2026-08-06T15-49-19Z__mobile.md`).

**Score trend for the `mobile` target (all runs to date, out of 40):**

| Date | Score | Notes |
|---|---|---|
| 2026-08-03 | 27/40 | Baseline |
| 2026-08-03 | 25/40 | Same-day re-check |
| **2026-08-06 (round 1, pre-fix)** | **28/40** | This session's first run |
| **2026-08-06 (round 2, post-fix)** | **27/40** | After the 4 fixes below — see "Why the score dipped" |
| **2026-08-06 (round 3, post-follow-up)** | **32/40** | After the theme-toggle follow-up fix — see "Run 3" |

---

## Run 1 — Pre-fix critique (28/40, Acceptable)

Method: dual-agent (A: `a0e3a8dd41cbbff55` · B: `a8e9ee55248a49482`)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dismiss submission had no busy indicator — `MorningTaskScreen.tsx` passed `disabled={submitting}` but never `loading={submitting}` |
| 2 | Match System / Real World | 3 | Calendar told users "Got it first try" / "Needed one hint" from data that didn't track either |
| 3 | User Control and Freedom | 3 | Real-alarm lock correctly scoped and intentional; demo-exit fix (Task #45) verified working |
| 4 | Consistency and Standards | 2 | `PuzzleTile.tsx` set `accessibilityRole`/`accessibilityState` on its tiles; the structurally identical option `Pressable`s in `MorningTaskScreen.tsx` set neither |
| 5 | Error Prevention | 3 | `WordLibraryErrorBanner` handled fetch failure well; `AddAlarmScreen.tsx` allowed duplicate/overlapping alarm times with no validation |
| 6 | Recognition Rather Than Recall | 3 | Home footer stacked "+ Add alarm", "Try the alarm", and the theme toggle as three near-equal-weight pills |
| 7 | Flexibility and Efficiency | 2 | No alarm-edit path (delete + recreate loses the label); no bulk actions |
| 8 | Aesthetic and Minimalist Design | 3 | Gradient/glass/serif system followed faithfully; `AdScreen.tsx` injected a hard commercial brand card that broke the calm system |
| 9 | Error Recovery | 4 | Wrong-answer handling: shake, soft color, always-visible hint, non-punitive copy, no score penalty |
| 10 | Help and Documentation | 2 | Nothing in onboarding warned that the real alarm can't be dismissed without a correct answer |
| **Total** | | **28/40** | **Acceptable** |

### Design Specificity Verdict

Genuinely authored for Zazu — `theme.ts` traces line-by-line back to the web prototype's real CSS selectors, copy voice is specific throughout, and the dawn/dusk theme-blend engine in `lib/adaptive-theme.ts` is a bespoke, on-brand idea. Undercut by the fact that engine was dead code on mobile at the time of this run.

The detector (`detect.mjs`) returned 0 findings — confirmed as a coverage-gap null result, not a clean bill: its 59 rules target CSS/Tailwind/HTML syntax and structurally cannot parse React Native's `StyleSheet.create()` (102 files use it; 0 use Tailwind/className in app source).

### Priority Issues Found

1. **[P0] The one screen a real user cannot exit had no accessibility semantics.** `MorningTaskScreen.tsx`'s answer options had no `accessibilityRole`/`accessibilityLabel`/`accessibilityState`, and nothing announced when an answer resolved or the Dismiss button appeared. A VoiceOver/TalkBack user facing a real, locked alarm had no reliable way to know what they'd tapped or whether they could leave.
2. **[P1] The "no hint, no snooze" reward mechanic didn't exist in code.** `completeWord` always passed `noSnooze: true` regardless of wrong attempts; the calendar's "Got it first try" label was actually derived from `coinsEarned >= 50` (a proxy for streak length), not real attempt data — the calendar was telling users false things about their own history.
3. **[P1] Every fresh install opened in dark mode regardless of system appearance, and the dawn/dusk theme engine was dead code.** `ThemeContext.tsx` hardcoded `useState('dark')`; `lib/adaptive-theme.ts`'s dawn/dusk blend was only ever called from the web prototype.
4. **[P2] Real controls fell below the app's own 44pt minimum** — `WordDetailSheet`'s gym buttons, the error banner's retry button.
5. **[P2] `TimeWheelPicker` — the only way to set an alarm time — had zero accessibility props.**

### Persona Red Flags

- **Sam (Accessibility-Dependent):** broke down twice in the core loop — no accessible way to set a time, no accessible way to answer the MCQ that silences a real alarm.
- **Jordan (First-Timer):** no onboarding warning that the real alarm locks until answered correctly.
- **Casey (Distracted Mobile):** session state lived only in React context, not `AsyncStorage` — an OS-level app kill mid-flow silently bounced Casey to Home with no explanation.

**User's scoping decision:** tackle the P0 accessibility gap, the broken reward data, and the dark-mode/dawn-dusk default first (top 3 of 5 findings).

---

## Fixes applied

1. **`MorningTaskScreen.tsx` accessibility** — added `accessibilityRole="button"` + `accessibilityState={{selected, disabled}}` to answer options; added `AccessibilityInfo.announceForAccessibility` calls on correct answer, wrong answer (includes the hint text), and when the Dismiss button becomes available; added `loading={submitting}` to the Dismiss button so it shows a spinner instead of looking dead during the async write.
2. **`TimeWheelPicker.tsx` accessibility** — wrapped each Hour/Minute wheel column with `accessibilityRole="adjustable"`, `accessibilityLabel`, `accessibilityValue`, and `accessibilityActions` (increment/decrement) backed by a real handler.
3. **Real first-try tracking** — added a `firstTry` field to `UserWordProgressLocal`; `MorningTaskScreen.tsx` now tracks real wrong-answer attempts and passes `firstTry: wrongAttempts === 0` to `completeWord`, which persists it; `calendar-utils.ts` now derives the calendar's "first try" label from that real field instead of the coin-total proxy. Verified end-to-end: type → write → read → render.
4. **Dawn/dusk theme engine wired up** — `ThemeContext.tsx` no longer hardcodes `'dark'`. It now defaults to an `'auto'` mode driven by the existing `getThemeBlend`/`resolveThemePalette` functions, re-checking the clock every 60 seconds so the gradient actually moves during a long session.

All four verified with `npx tsc --noEmit` (zero errors) and committed.

---

## Run 2 — Post-fix re-critique (27/40, Acceptable)

Method: dual-agent (A: `af1ffbae399618b50` · B: `af4dd0879356e3654`)

### Fix Verification

| Fix | Verdict |
|---|---|
| MorningTaskScreen accessibility | **VERIFIED-CORRECT** — role/state/announcements all present and wired to real behavior, not dangling props |
| TimeWheelPicker accessibility | **VERIFIED-CORRECT** — adjustable role, value, working increment/decrement actions |
| Real firstTry tracking | **VERIFIED-CORRECT, end-to-end** — old `coinsEarned >= 50` proxy confirmed gone via grep; full type → write → read → render chain verified |
| ThemeContext auto dawn/dusk | **VERIFIED-CORRECT**, with a side effect neither assessment had anticipated (see below) |

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | New a11y announcements + busy-loading closed the prior gap, but the active theme mode (auto vs. manual) wasn't surfaced anywhere in the UI |
| 2 | Match System / Real World | 3 | No regressions |
| 3 | User Control and Freedom | 2 | **New gap**: the manual theme toggle was one-way — no route back to `'auto'` once tapped, without restarting the app |
| 4 | Consistency and Standards | 3 | MCQ options used `accessibilityRole="button"` rather than a radio/group pattern — defensible, not textbook |
| 5 | Error Prevention | 3 | `dismissReady`/`submitting` guards prevent bad states |
| 6 | Recognition Rather Than Recall | 3 | Streak/coins always visible; correct/wrong state persists visually |
| 7 | Flexibility and Efficiency | 2 | New a11y increment/decrement on the time wheel were a real win, but the theme system lost a return path to auto — a small flexibility regression from the fix itself |
| 8 | Aesthetic and Minimalist Design | 3 | Consistent with DESIGN.md; undercut only by known carry-over touch-target debt |
| 9 | Error Recovery | 3 | Hint + shake + now a spoken announcement on wrong answer — genuinely strong |
| 10 | Help and Documentation | 2 | Unchanged, adequate for scope |
| **Total** | | **27/40** | **Acceptable** |

### Why the score dipped (28 → 27) despite real fixes

Not noise — both independent assessments flagged the same new issue: **the theme fix itself introduced a one-way door.** Once a user taps the manual light/dark toggle, `'auto'` (the dawn/dusk engine) was unreachable for the rest of the session. Heuristics 3 and 7 were marked down for this; heuristics 1 and 9 improved from the genuinely-fixed screen-reader gaps. Net effect: real progress on the highest-stakes accessibility issue, offset by one small, self-inflicted UX dead end.

> Assessment A, on the accessibility fixes specifically: *"This persona's [Jordan, a VoiceOver user] primary-flow experience moved from broken to genuinely good this round... the single most consequential improvement in this round."*

### Remaining Priority Issues (post Run 2)

- **[P1] Theme toggle had no way back to Auto** — *fixed in this same session, immediately after this report* (see "Follow-up fix" below).
- **[P2] Current theme mode was invisible in the UI** — *also fixed in the same follow-up* (toggle label now reads "Theme: Auto (Dawn/Dusk)" / "Theme: Light" / "Theme: Dark").
- **[P3] Carryover, out of scope both rounds:** undersized touch targets in `WordDetailSheet.tsx` (`gymBtn`/`gymUnlockBtn`) and `WordLibraryErrorBanner.tsx` (`btn`) — all ~26-28pt against the app's own 44pt `MIN_TOUCH_TARGET` constant.
- **[P3] Carryover, out of scope both rounds:** `AdScreen.tsx`'s primary CTA and "Skip" both route to the same place (`/gym-success`) — a decoy CTA with no distinct action, plus an 8pt skip hit target.
- **Minor, noted for awareness, not fixed:** the web prototype's `lib/calendar-web.js` still computes "first try" via the old coin-proxy — it's now silently diverged from the corrected mobile logic. Out of scope per PRODUCT.md ("mobile is primary, web mirrors it"), but worth a follow-up so it doesn't stay permanently wrong.

### Persona Red Flags (post-fix)

- **Jordan (VoiceOver/TalkBack):** the alarm-dismiss task moved from broken to genuinely good — hears "Correct. [word]." instead of silence, "You can now dismiss the alarm" instead of blindly re-exploring, and can now operate the time picker via rotor increment/decrement instead of dragging a scroll view with no eyes.
- **Sam (groggy, half-asleep, default system theme):** now wakes into a correctly-blended dawn palette instead of snapping to full dark regardless of time; sees a spinner instead of a dead-looking button during dismiss.
- **Casey (one-handed, distracted):** still hits the confirmed-open small touch targets in the calendar's word-detail sheet (carryover P3).

### Provocative Questions Raised

1. If the app's entire premise is "the alarm can't be dismissed without engaging," why does `AdScreen.tsx` let the primary CTA and "Skip" achieve the exact same outcome?
2. Now that theme has a real `'auto'` mode matching DESIGN.md's dawn/dusk language, should a manual override ever be permanent for a session?
3. The screen-reader fixes are strong on paper — has this been run with VoiceOver/TalkBack on a real device yet, or is source-level correctness the only validation so far?

---

## Follow-up fix

In direct response to the round-2 P1/P2 above, the theme toggle now cycles **`auto → light → dark → auto`** (previously a one-way `auto → light/dark` with no return path), and its label now names the *current* state rather than only the next action:

- `Theme: Auto (Dawn/Dusk)`
- `Theme: Light`
- `Theme: Dark`

Files: `mobile/context/ThemeContext.tsx`, `mobile/components/home/HomeScreen.tsx`, `mobile/constants/copy.ts`. Verified with a fresh `npx tsc --noEmit` (zero errors).

---

## Run 3 — Post-follow-up re-critique (32/40, Good)

Method: dual-agent (A: `aa0990f22fe56f8a8` · B: `a4ff1ab4c44c45940`)

### Fix Verification

**3-way theme toggle cycle — VERIFIED-CORRECT**, confirmed independently by both assessments via direct grep/read of current file state: genuine sequential cycle (not a 2-way flip), no `useColorScheme`/`Appearance` remnants from the round-2 approach, label derived from current `override` state, old `switchToLightMode`/`switchToDarkMode` copy keys confirmed removed with zero dangling references anywhere in `mobile/`. `tsc --noEmit` clean.

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Theme toggle now correctly shows live state; dismiss button shows a spinner but no live-region announcement while submitting |
| 2 | Match System / Real World | 4 | "Theme: Auto (Dawn/Dusk)" / "Theme: Light" / "Theme: Dark" map directly to a 3-state mental model |
| 3 | User Control and Freedom | 4 | Theme is now fully reversible in either direction — the round-2 dead end is gone |
| 4 | Consistency and Standards | 3 | The theme toggle lives as a full-width Home-footer button, absent from `SettingsScreen.tsx` where a preference control would conventionally live |
| 5 | Error Prevention | 3 | Wrong-answer options shake and re-enable rather than lock out; dismiss disabled until ready |
| 6 | Recognition Rather Than Recall | 4 | Current mode is always visible on the button face — exactly what round 2 flagged as missing, now fixed |
| 7 | Flexibility and Efficiency | 2 | Cycle is at most 2 taps to reach any of 3 states; no accelerator for a stuck wrong-answer loop |
| 8 | Aesthetic and Minimalist Design | 3 | Same IA point as #4 costs here too — three full-width, equal-weight footer pills crowd a screen DESIGN.md wants calm, not a dashboard |
| 9 | Error Recovery | 3 | Clear inline retry with `accessibilityRole="alert"`; wrong-answer feedback stays calm and specific |
| 10 | Help and Documentation | 3 | Theme toggle has no `accessibilityHint` explaining its cycling behavior to screen-reader users |
| **Total** | | **32/40** | **Good** |

### Why the score recovered past the original baseline (28 → 27 → 32)

Heuristics 2, 3, and 6 all moved to Good/Excellent on the back of one correctly-verified, surgical fix (7 lines in `ThemeContext.tsx`, no changes to blend/palette resolution logic). The round-2 dead end is genuinely closed — both issues raised that round (no way back to auto; label showed next-action not current-state) closed together.

### Remaining Priority Issues (post Run 3)

- **[P1] Theme toggle is IA-misplaced** — a full-width Home-footer button competing visually with "Add alarm"/"Try the alarm," and absent from `SettingsScreen.tsx`. Not new this round, but more visible now the label is longer and clearer. Fix: move into Settings as a labeled row, or demote to a small icon-only control.
- **[P2] No `accessibilityHint` on the theme toggle** — a screen-reader user hears the current state but has no indication that activating it cycles to the next mode.
- **[P3] Dismiss button gives no live-region status while submitting** — silence during the async `completeWord` write, at the app's single highest-stakes moment.
- **[P3] Theme override doesn't persist across app restart** — resets to `'auto'` every cold start; possibly intentional, undocumented either way.
- **[P3] Carryover, confirmed still present, out of scope all three rounds:** undersized touch targets in `WordDetailSheet.tsx`/`WordLibraryErrorBanner.tsx`; `AdScreen.tsx`'s primary CTA and "Skip" both call the identical handler routing to `/gym-success`.

### Persona Red Flags (post-follow-up)

- **Riley (screen-reader user):** the alarm-dismiss path holds up under re-inspection. The theme toggle is a real improvement over round 2 — can now discover the current mode by focus alone — but still doesn't know what double-tapping *does* without tapping blind first (P2 above).
- **Jordan (habitual daily user):** unlikely to ever touch the theme toggle mid-flow; on the rare exploration, can always get back to auto without remembering which mode "auto" corresponds to.
- **Sam (first-time/skeptical evaluator):** sees three stacked full-width buttons of equal visual weight on first open, before ever engaging with a word — reinforces the P1 placement issue.

### Provocative Questions Raised (round 3)

1. If theme is a genuine user preference rather than a task action, why does it live in the Home footer instead of the Settings screen that already exists for account/subscription controls?
2. Now that theme resets to `'auto'` on every restart, is "always wake up in dawn/dusk mode" the desired behavior, or should a user's last explicit choice survive overnight?
3. Is "zero wrong attempts" actually legible to the user as the reward-eligibility bar at quiz time, given the app proactively shows a hint on the first wrong answer?

---

## Open items going into the device build

1. Theme toggle IA placement (P1) and missing `accessibilityHint` (P2) — not yet scheduled.
2. Undersized touch targets in `WordDetailSheet.tsx` / `WordLibraryErrorBanner.tsx` (carried over from 2026-08-03, still open across all three rounds).
3. `AdScreen.tsx`'s decoy CTA / undersized skip target (carried over from 2026-08-03, still open across all three rounds).
4. No live device/VoiceOver verification has been done yet — everything above is source-level correctness only, per all three rounds' explicit caveat (no browser/screenshot tooling or running dev server was available in this session).
5. Web prototype's `calendar-web.js` still uses the old first-try proxy — out of scope for mobile but silently diverging.
