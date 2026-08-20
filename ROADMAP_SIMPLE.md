# Zazu roadmap — simple version

The short list. For full detail, evidence, and status notes, see [ROADMAP.md](ROADMAP.md) and, for the most recent work, [POST_APP_TEST_ROADMAP.md](POST_APP_TEST_ROADMAP.md).

## Do next

- **(2026-08-21, big/needs a product decision)** Can Gold users draw their morning alarm word from a Word Pack they've unlocked, instead of (or alongside) the shared global Word of the Day — or are packs strictly Word Gym-only, as built? As shipped, pack words are **deliberately excluded** from the alarm: they never get a `word_morning_tasks` row, so `words_alarm_format`'s inner join skips them automatically. Making them alarm-eligible isn't a small toggle — the whole alarm system was rebuilt around one global, date-keyed word specifically to kill a past bug where personalized word selection made the alarm/home/calendar disagree with each other (see "Fixed Word of the Day" below). Opening this up for Gold users means reintroducing *per-user* alarm personalization, just for that segment — needs real answers before any code: does the free global word keep firing regardless, with a pack word as an extra personal slot, or does it replace the daily word entirely for that user? Do streak/coins work the same way? Packs are currently flat word lists with no per-day structure — what decides which pack word lands on which day?
- Configure RevenueCat properly and run one real sandbox purchase *(needs you — dashboard/store access)*
- **(2026-08-20, P1)** Morning task (`MorningTaskScreen.tsx`) risks overloading a user the product's own premise assumes is half-asleep: 15–20 simultaneous tap targets per passage, no default definition reminder (hint only appears after a wrong attempt), and a code comment claiming "deliberately generous" touch targets that the actual style (vertical padding only, no horizontal) doesn't back up.
- **(2026-08-20, P2)** Alarm screen shows the wake CTA, snooze slider, and snooze button all at once — two competing actions plus a drag-precision interaction at the single highest-stakes, groggiest moment in the app.
- **(2026-08-20, P2)** Settings, Add Alarm, Name-entry onboarding, and the Gold paywall all reduce to the same glass-card-and-pill-button chrome with nothing Zazu-specific — confirmed at scale (glassmorphism touches 21 of ~46 component files, uppercase eyebrow labels appear 33 times across 19 files). Gold specifically doesn't read as "elevated" despite `Design.md` calling for that.
- **(2026-08-20, minor)** Two hardcoded hex colors slipped past the "always use `useTheme().colors`" rule: `PuzzleTile.tsx` (`#d0c0e8`, no matching token) and `FloatingTabBar.tsx` (`#1a1225`, which duplicates the existing `colors.ink` token exactly — one-line fix).
- **(2026-08-20, minor)** `GymMcqSessionScreen.tsx` and `GymLiteraryRoundScreen.tsx` are near-duplicate implementations with behavior already drifting apart (one shows a wrong-answer hint, the other doesn't).
- **(2026-08-21)** Home consistently shows "Could not load words from the cloud, using the built-in library for now" on-device, every session this week — the app falls back to 3 hardcoded demo words instead of the real 395-word Supabase bank. Never actually diagnosed. Worth root-causing (network, RLS, or a bad RPC call) since it silently degrades every screen that reads word data, not just a cosmetic banner.
- **(2026-08-21)** Vocabulary's missed-word coin-unlock flow is built and code-reviewed but **not yet exercised on a real device** — with only 3 demo words cycling (see above) and all 3 already learned, no "missed day" state existed to tap during testing.

<details>
<summary>Done since 2026-08-09 (first real device test)</summary>

- ~~Word Gym's reward flow forced a static, non-opt-in ad~~ — `PuzzleScreen.tsx` routed non-Gold Gym completions through a mock-Huel `/ad` interstitial before `gym-success`, contradicting the "ads are strictly opt-in" principle in `PRODUCT.md`. Now always routes straight to `gym-success`; `AdScreen.tsx`/`app/ad.tsx` left in place, unreferenced, for the future rewarded-video rebuild.
- ~~Settings' Theme row was invisible as a control, and cycling instead of picking was bad UX~~ — replaced the cycle-on-tap badge with a real expand-in-place picker (downward chevron, flips to upward when open, Auto/Light/Dark listed directly with a checkmark on the active one — `ThemeContext.setOverride` exposed alongside the existing `toggleOverride`/cycle). Also dropped the filled-pill "badge" treatment for row values (Theme, Plan) in favor of plain colored text, and fixed the Settings screen's big dead vertical gap (`justifyContent: 'center'` on a short page) — both raised as "cards in cards, doesn't look very good."
- ~~Coin Economy + Thematic Word Packs~~ — **built 2026-08-21**, see "Later / backlog" below for what shipped vs. the original spec
- ~~Alarm screen redesign, Chime→rotating-greeting swap, nested-cards cleanup~~ — `AlarmScreen.tsx`/`AlarmOrbs.tsx` redesigned per direct feedback and verified on-device; "Chime" alarm sound replaced with a daily rotating greeting; flattened nested-card clutter across Add Alarm, Home, Gym, and Calendar (`a0c7629`)
- ~~Daily Ritual repeated the wake-up task's tap-to-find-the-word step verbatim~~ — the post-alarm bonus flow now only asks its MCQ questions, no duplicate passage step (`819ab38`)
- ~~The alarm not working~~ — screen wake, chime playback, and post-firing routing were each broken for release builds in different ways; all fixed and confirmed via on-device logcat testing (see `ALARM_DEBUG_SESSION_2026-08-15.md`)
- ~~The wake-up task being a bad fit~~ — replaced the letter-spelling puzzle with a tap-to-find-the-word-in-a-sentence task after sleep-inertia/memory research; live and tested on-device
- ~~Sweep `copy.ts` for em dashes~~ — none remain
- ~~Anti-AI-UI-pattern sweep~~ — via `/impeccable critique`, scored 29/40; individual findings tracked as dated items above
- ~~Alarm wake-up screen redesign missed the mark~~ — rebuilt per direct feedback across several rounds (sizing, orbs, layout, button), verified on-device
- ~~Fixed a native crash on app launch~~ — `expo-av` (unmaintained, unused) was migrated to `expo-audio`
- ~~Fixed custom alarm tunes cutting off after ~1s instead of playing in full~~
- ~~Fixed Word of the Day~~ — was UTC-based (wrong near midnight in non-UTC timezones) and inconsistently filtered by learned-words across 5 different screens, so alarms/home/calendar could each show a different word. Now a single global value, same for every user on the same local calendar day.
- ~~Snooze duration~~ — was a fixed 8 minutes, now a 1–20 min slider (researched against other alarm apps + sleep science)
- ~~Word Gym card spacing and progress-dot placement~~
- ~~Typography~~ — sizes bumped, serif swapped to the more readable `DM Serif Text`
- ~~Z logo stray-pixel bug~~
- ~~Word Gym "Usage" round completions were all wrongly capitalized~~ — 1,000 live rows fixed

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

- **Rewarded-video ads** (opt-in coin-earning, capped ~3/day) — the earning-loop half of the 2026-08-09 Coin Economy spec. Not built; still needs an ad SDK choice.
- Wake-up task passage length is currently always short (one sentence) — add a longer-paragraph option (user-selectable) later, deliberately deferred to keep the content pipeline simple for v1
- Word reroll (pick a different alarm word once a day) — in tension with Word of the Day now being a shared, non-personal value; needs a product decision, not just a build
- Analytics + crash reporting
- **(2026-08-21)** Bottom nav bar (`FloatingTabBar.tsx`) should feel more interactive — animated, sliding active-pill transition between tabs instead of the current instant swap
- **(2026-08-21)** Snooze UI (`SnoozeSlider.tsx` + the snooze button/copy on `AlarmScreen.tsx`) needs a real design pass — user's verdict on-device: "terrible" as it stands. Related to the P2 finding above about it competing with the wake CTA, but this is about the snooze control's own visual quality, not just its placement.

## Not doing

- The old copy's icon fallback component — conflicts with the icon migration already shipped
- Porting the old coin shop screen as-is — it's a placeholder with nothing to buy
