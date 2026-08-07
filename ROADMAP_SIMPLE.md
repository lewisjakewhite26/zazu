# Zazu roadmap — simple version

The short list. For full detail, evidence, and status notes, see [ROADMAP.md](ROADMAP.md).

## Do next

Everything code-only from the original list is done. Two things left, and both need you, not more code:

- Configure RevenueCat properly and run one real sandbox purchase *(needs you — dashboard/store access)*
- Build the EAS dev build and install it on a real phone *(needs you — Expo account + device — this would also let us verify snooze actually re-fires a notification, which needs a real device)*

<details>
<summary>Done this round</summary>

- ~~Commit the pending word-bank sync~~
- ~~Demo-alarm exit affordance~~ — no gap found
- ~~Add a few automated tests~~ — webhook signature/entitlement logic + a structural RLS-policy regression test (real Postgres integration testing still needs Docker/Supabase CLI, which this environment doesn't have)
- ~~Port the native floating tab bar~~ — now floating on all platforms (was web-only before)
- ~~Rebuild Word Gym practice modes~~ — review queue, roots drill, usage lab, all built on data already in the library
- ~~Wire up the Literary word pack~~ — 270 words live in Supabase, paywall verified with a real test subscriber (found and fixed one bad quiz answer in the data along the way)
- ~~Build snooze properly~~ — 8 min reschedule, no bonus if used, one per day

</details>

## Later / backlog

- Word reroll (pick a different alarm word once a day)
- The other 8 thematic word packs — needs real word content written first, nothing to port
- Ad SDK integration (replace the mock ad card)
- Analytics + crash reporting
- Coin shop — wait until there's a real item to spend coins on

## Not doing

- The old copy's icon fallback component — conflicts with the icon migration already shipped
- Porting the old coin shop screen as-is — it's a placeholder with nothing to buy
