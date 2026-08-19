# Zazu Mobile — UX/UI Critique, 2026-08-19

Re-run of `/impeccable critique mobile` via the project's dual-agent protocol (Assessment A: unanchored design review · Assessment B: detector + grep-evidence pass, isolated sub-agents). Raw snapshot: `.impeccable/critique/2026-08-19T17-21-42Z__mobile.md`.

**Note on prior history:** `UX_CRITIQUE_2026-08-06.md` documents Runs 1-3 (28 → 27 → 32/40) but stops before a 4th round that same day. The archive shows Run 4 (2026-08-06T20:58) verified 7 more fixes and reached **35/40** — that doc is stale by one round.

**Score trend for the `mobile` target (out of 40):**

| Date | Score | Notes |
|---|---|---|
| 2026-08-06 (run 1) | 28/40 | See `UX_CRITIQUE_2026-08-06.md` |
| 2026-08-06 (run 2) | 27/40 | " |
| 2026-08-06 (run 3) | 32/40 | " |
| 2026-08-06 (run 4) | 35/40 | Not documented in the 08-06 file; 7 fixes verified, all held |
| **2026-08-19 (this run)** | **22/40** | **Regression — see below** |

---

## Why the score dropped (35 → 22)

Every fix verified through Run 4 is still holding — theme toggle, AdScreen CTA, dismiss busy-state, gym-button hit slop, etc. The drop is entirely attributable to two brand-new, never-before-reviewed surfaces shipped since Run 4:

1. **The morning-task mechanic was rebuilt.** The bounded 2-3-option MCQ was replaced with a tap-the-word-in-a-passage mechanic (`lib/word-spotting.ts`, `MorningTaskScreen.tsx`) — an unbounded ~15-20-token search with no cap on wrong attempts, at the single highest-stakes moment in the app (a locked, un-dismissable real alarm).
2. **A new post-alarm "Daily Ritual" bonus flow was added** (`lib/daily-ritual.ts`, `mobile/app/daily-ritual.tsx`, `mobile/components/dailyritual/DailyRitualScreen.tsx`) with no exit control once started and no busy indicator on completion.

Separately, `lib/spelling-puzzle.ts` — logic for the drag-and-drop letter-spelling puzzle floated in `PRODUCT.md`'s roadmap — is fully built and unit-tested but has **zero UI consumers**. Per the user: that mechanic was tried in concept and rejected as bad UX, so the tap-to-find passage is the deliberate direction instead, kept open to further iteration if it doesn't function well in practice.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `DailyRitualScreen.tsx`'s async completion shows no busy indicator |
| 2 | Match System / Real World | 3 | Passage word-tokens have no "tappable" affordance until touched |
| 3 | User Control and Freedom | 1 | Daily Ritual has no close/back/skip once started |
| 4 | Consistency and Standards | 3 | Ungated debug CTA bypasses `copy.ts` and the app's own `__DEV__` convention |
| 5 | Error Prevention | 1 | Morning task went from bounded MCQ to unbounded passage search, no cap on wrong taps |
| 6 | Recognition Rather Than Recall | 3 | Still fully recognition-based |
| 7 | Flexibility and Efficiency | 2 | No fast-path for repeat users |
| 8 | Aesthetic and Minimalist Design | 3 | Debug button crowds the calm Home footer |
| 9 | Error Recovery | 1 | `morningTask.hint` exists on every word, never rendered — dead data, no escalating help |
| 10 | Help and Documentation | 2 | No first-run explainer for the new tap-to-find mechanic |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

Core screens (alarm, success, gym) remain genuinely Zazu-authored. The two new surfaces are functionally generic "find the word" mini-games — nothing distinctively Zazu about the interaction, and the one Zazu-specific touch (the etymology-tied `hint` field) was dropped in the rebuild rather than carried forward. Detector (`detect.mjs`) returned 0 findings again — confirmed coverage gap (can't parse RN `StyleSheet.create()`), not a clean bill.

## Priority Issues

1. **[P0] No recovery path in the highest-stakes flow.** `morningTask.hint` is populated per-word (`lib/morning-task.ts:23`, `lib/demo-alarm-words.ts:26`) but never read or rendered by `MorningTaskScreen.tsx` or `DailyRitualScreen.tsx`. `wrongAttempts` is tracked but only feeds a "first try" coin bonus, never a hint reveal. Fix: surface the hint after 2 wrong taps, mirroring `GymMcqSessionScreen.tsx`'s existing hint pattern.
2. **[P0] Ungated debug CTA ships to production.** `mobile/components/home/HomeScreen.tsx:147-152` renders "Quick test alarm (+2 min)" unconditionally, hardcoded copy bypassing `copy.ts`, unlike every other dev affordance in the codebase (`ProgressDebugPanel.tsx`, Settings' "Grant Gold (dev)" row), which are `__DEV__`-gated.
3. **[P1] Seven interactive files have zero accessibility props at all** (confirmed via direct re-grep): `WordDetailSheet.tsx`, `GymScreen.tsx`, `GymModeCard.tsx`, `GymLiteraryRoundScreen.tsx`, `GymMcqSessionScreen.tsx`, `AppAlert.tsx`, `GoldPaywallScreen.tsx` — wider than the new-surface regression, covers all of Word Gym + the Gold paywall. `WordDetailSheet.tsx`'s `gymBtn`/`gymUnlockBtn` (`:228-234`, `:278-285`) are also still under the app's 44pt `MIN_TOUCH_TARGET`, though both carry `hitSlop:10` which likely resolves the tappable-area concern even if the visible chip stays ~26-28pt.
4. **[P1] Daily Ritual: no exit, no busy state on finish, inconsistent screen-reader announcements within itself.** No close/back/skip control anywhere once started, contradicting its own "no pressure" copy (`copy.ts:168`). Async `finishRitual` shows no spinner while `completeDailyRitual` awaits. Within the same file, the passage step announces "Correct." to screen readers (`:105`) but the MCQ step (`handleSelectOption`, `:77-94`) never announces right or wrong at all.
5. **[P2] Tap-to-find passage is a heavier screen-reader burden than the MCQ it replaced** — 15-20 individually-labeled tokens to swipe through vs. 2-3 options before; short tokens ("a", "up") also use tight padding with no `hitSlop`.

## Persona Red Flags

- **Sam (screen-reader):** stuck swiping ~17 tokens to dismiss a real alarm; also hits total silence across Word Gym and the Gold paywall (7-file finding above).
- **Casey (distracted, one-handed):** small filler-word tap targets + no hint after wrong taps = can get genuinely stuck at the app's highest-stakes moment.
- **Riley (stress tester):** no exit from Daily Ritual if backgrounded/killed mid-flow; `daily-ritual.ts` guards against an unspottable target word, `MorningTaskScreen.tsx` has no equivalent guard.

## Minor Observations

- `lib/spelling-puzzle.ts` is fully built and tested but has zero UI consumers — confirmed dead code; the shipped mechanic is tap-to-find, not spelling (see note above on why).
- `copy.morningTask.spellPrompt` / `copy.dailyRitual.skip` are defined, referenced nowhere — dead copy from a mid-build pivot.
- `PuzzleTile.tsx:46`'s `'#d0c0e8'` isn't one of `theme.ts`'s 29 documented hex tokens — genuinely un-tokenized color.
- `theme.ts` defines `peach`/`lavender` accent constants with different hex values than DESIGN.md's same-named gradient stops — likely intentional (distinct accent vs. gradient), worth a second look.
- No live device/VoiceOver test has been done in any of the 5 critique rounds to date (2026-08-06 ×4, this run).

## Open items going into next steps

1. **[P0] Hint/recovery path** — not yet scheduled, user to weigh in on approach.
2. **[P0] Ungated debug CTA on Home** — not yet scheduled, user to weigh in on approach.
3. **[P1] Accessibility sweep** (7 files) — not yet scheduled.
4. **[P1] Daily Ritual exit/loading/announcement gaps** — not yet scheduled.
5. **[P2] Passage screen-reader burden** — noted, no fix scheduled; mechanic itself confirmed deliberate (not a stopgap) per user, open to revision only if it doesn't function well in practice.
