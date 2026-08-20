# Zazu roadmap — simple version

The short list. For full detail, evidence, and status notes, see [ROADMAP.md](ROADMAP.md) and, for the most recent work, [POST_APP_TEST_ROADMAP.md](POST_APP_TEST_ROADMAP.md).

## Do next

The EAS dev build now exists and runs on a real phone (2026-08-09) — that unblocked the first real on-device test pass, which found real bugs (now fixed) and one big architecture gap that's still open:

- ~~**(2026-08-15) The alarm not working**~~ — **Fixed 2026-08-18.** Screen wake, chime playback, and post-firing routing to `/alarm` were each broken for release builds in different ways (missing full-screen Activity flags, `expo-audio` asset resolution under Metro's release renaming, WorkManager- instead of AlarmManager-backed scheduling, and a background-delivery routing race). All fixed and confirmed via on-device logcat testing; see `ALARM_DEBUG_SESSION_2026-08-15.md` for the full trail. `@notifee/react-native` (archived) was also swapped for the maintained fork `react-native-notify-kit`.
- **(2026-08-15) The wake up task being shit** — the letter-spelling puzzle (tap letters to spell the Word of the Day, word hidden) was a worse fit than the MCQ it replaced: recalling a word's exact spelling from memory is harder than recognizing it, and nobody groggy at 6am manages it. **2026-08-19: redesigned after deep research into sleep-inertia/memory science** (nothing dissipates sleep inertia in the first 15 min post-waking; speed is impaired far more than accuracy; blind recall of brand-new material isn't "desirable difficulty," it's just guessing). New design: alarm dismissal is a plain untimed button with zero cognitive gate, and the actual word-of-the-day task is tap-to-find — the word appears in a short sentence, the user just has to spot and tap it (recognition, not recall or spelling). Built and wired in as a replacement for the spelling puzzle (`lib/word-spotting.ts`, rewritten `MorningTaskScreen.tsx`), currently only using hand-written passages on the 3 hardcoded demo words (`lib/demo-alarm-words.ts`) pending on-device test. Passages are meant to be pre-generated per word (LLM-authored, not sourced from public-domain text — licensing risk and can't guarantee the exact word form appears) and stored per word, never generated live at alarm-fire time.
- **(2026-08-19, backlog)** Wake-up task passage length is currently always short (one sentence). Add a longer-paragraph option (user-selectable) in a later release — deliberately deferred out of v1 to keep the content-generation pipeline and first test simple.
- Configure RevenueCat properly and run one real sandbox purchase *(needs you — dashboard/store access)*
- **(2026-08-20)** Sweep `mobile/constants/copy.ts` for em dashes — user spotted some they don't like the look/voice of in-app. Needs a pass to find and replace with preferred punctuation (comma, period, or restructured sentence, TBD).
- ~~**(2026-08-20)** Run an anti-AI-UI-pattern sweep against `mobile`~~ — **Done 2026-08-20**, via `/impeccable critique mobile/components` (dual assessment: design review + detector/grep evidence). Scored 29/40 (Good). Full report: `.impeccable/critique/2026-08-20T16-44-34Z__mobile-components.md`. Findings now tracked as the dated items below.
- **(2026-08-20, P0)** Word Gym's reward flow forces a static, non-opt-in ad (`AdScreen.tsx`, mock Huel content) before `gym-success`, contradicting the "ads are strictly opt-in" principle in `PRODUCT.md`. This is the same placeholder the Coin Economy spec (see "Later / backlog" below) already plans to replace with capped, opt-in rewarded video — not a new separate task, just confirms that replacement is worth prioritizing. Interim option: stop force-showing the placeholder ad until the rewarded-video flow is built.
- **(2026-08-20, P1)** Morning task (`MorningTaskScreen.tsx`) risks overloading a user the product's own premise assumes is half-asleep: 15–20 simultaneous tap targets per passage, no default definition reminder (hint only appears after a wrong attempt), and a code comment claiming "deliberately generous" touch targets that the actual style (vertical padding only, no horizontal) doesn't back up.
- **(2026-08-20, P1)** Settings' Theme row is invisible as a control — no chevron, unlike the row below it — and its own fix already exists as unused code: `copy.settings.themeToggleHint` ("Cycles between Auto, Light, and Dark themes") is written in `copy.ts` but never rendered anywhere.
- **(2026-08-20, P2)** Alarm screen shows the wake CTA, snooze slider, and snooze button all at once — two competing actions plus a drag-precision interaction at the single highest-stakes, groggiest moment in the app.
- **(2026-08-20, P2)** Settings, Add Alarm, Name-entry onboarding, and the Gold paywall all reduce to the same glass-card-and-pill-button chrome with nothing Zazu-specific — confirmed at scale (glassmorphism touches 21 of ~46 component files, uppercase eyebrow labels appear 33 times across 19 files). Gold specifically doesn't read as "elevated" despite `Design.md` calling for that.
- **(2026-08-20, minor)** Two hardcoded hex colors slipped past the "always use `useTheme().colors`" rule: `PuzzleTile.tsx` (`#d0c0e8`, no matching token) and `FloatingTabBar.tsx` (`#1a1225`, which duplicates the existing `colors.ink` token exactly — one-line fix).
- **(2026-08-20, minor)** `GymMcqSessionScreen.tsx` and `GymLiteraryRoundScreen.tsx` are near-duplicate implementations with behavior already drifting apart (one shows a wrong-answer hint, the other doesn't).
- **(2026-08-20)** Alarm wake-up screen (`AlarmScreen.tsx`) redesign missed the mark — rebuilt to make the word-of-the-day the hero (was buried small text before), matching direction from a Google Stitch reference (`C:\Users\lewis\Downloads\alarmscreen`), but user's verdict on-device: not close enough to the Stitch reference, nowhere near as clean, dislikes the decorative background orbs (`AlarmOrbs.tsx`), and everything reads too small overall (word, time, caption). Needs another real pass — likely closer pixel-matching to the Stitch export rather than a token-reuse approximation, and reconsider whether `AlarmOrbs` belongs on this screen at all.

<details>
<summary>Done since 2026-08-09 (first real device test)</summary>

- ~~Fixed a native crash on app launch~~ — `expo-av` (unmaintained, unused) was migrated to `expo-audio`
- ~~Fixed custom alarm tunes cutting off after ~1s instead of playing in full~~
- ~~Fixed Word of the Day~~ — was UTC-based (wrong near midnight in non-UTC timezones) and inconsistently filtered by learned-words across 5 different screens, so alarms/home/calendar could each show a different word. Now a single global value, same for every user on the same local calendar day.
- ~~Snooze duration~~ — was a fixed 8 minutes, now a 1–20 min slider (researched against other alarm apps + sleep science)
- ~~Word Gym card spacing and progress-dot placement~~
- ~~Typography~~ — sizes bumped, serif swapped to the more readable `DM Serif Text`
- ~~Z logo stray-pixel bug~~
- ~~Word Gym "Usage" round completions were all wrongly capitalized~~ — 1,000 live rows fixed
- ~~Locked the Coin Economy + Thematic Word Packs spec~~ — see below

</details>

<details>
<summary>Done earlier</summary>

- ~~Commit the pending word-bank sync~~
- ~~Demo-alarm exit affordance~~ — no gap found
- ~~Add a few automated tests~~ — webhook signature/entitlement logic + a structural RLS-policy regression test (real Postgres integration testing still needs Docker/Supabase CLI, which this environment doesn't have)
- ~~Port the native floating tab bar~~ — now floating on all platforms (was web-only before)
- ~~Rebuild Word Gym practice modes~~ — review queue, roots drill, usage lab, all built on data already in the library
- ~~Wire up the Literary word pack~~ — 270 words live in Supabase, paywall verified with a real test subscriber (found and fixed one bad quiz answer in the data along the way)
- ~~Build snooze properly~~ — see above, later upgraded to a slider

</details>

## Later / backlog

- **Coin Economy + Thematic Word Packs** — spec locked 2026-08-09 (earn coins via daily habits + capped rewarded-video ads; 30-day themed Gym campaigns unlockable by coins or an all-access pass). Content already drafted for two packs (Games, Loan Words). Not built. See `ROADMAP.md` "Coin Economy & Thematic Word Packs" for the full spec and open questions (exact coin costs, ad SDK choice, double-gate vs. single-gate with the Gold subscription).
- Word reroll (pick a different alarm word once a day) — in tension with Word of the Day now being a shared, non-personal value; needs a product decision, not just a build
- Analytics + crash reporting

## Not doing

- The old copy's icon fallback component — conflicts with the icon migration already shipped
- Porting the old coin shop screen as-is — it's a placeholder with nothing to buy
