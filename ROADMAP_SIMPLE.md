# Zazu roadmap — simple version

The short list. For full detail, evidence, and status notes, see [ROADMAP.md](ROADMAP.md) and, for the most recent work, [POST_APP_TEST_ROADMAP.md](POST_APP_TEST_ROADMAP.md).

## Do next

The EAS dev build now exists and runs on a real phone (2026-08-09) — that unblocked the first real on-device test pass, which found real bugs (now fixed) and one big architecture gap that's still open:

- **Full-screen alarm intent** — the alarm can't wake a locked/killed phone yet, only a normal notification. Needs a `notifee` migration, its own focused session (native work, several EAS build cycles). See `POST_APP_TEST_ROADMAP.md` #1.
- **Drag-and-drop spelling dismissal** — replace the multiple-choice morning task with a letter-spelling puzzle on the Word of the Day. Now unblocked (Word of the Day is fixed and global). See `POST_APP_TEST_ROADMAP.md` #2.
- Configure RevenueCat properly and run one real sandbox purchase *(needs you — dashboard/store access)*

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
