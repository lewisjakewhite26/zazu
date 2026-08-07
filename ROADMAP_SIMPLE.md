# Zazu roadmap — simple version

The short list. For full detail, evidence, and status notes, see [ROADMAP.md](ROADMAP.md).

## Do next, in order

- Commit the pending word-bank sync (`WORDS.md`, `zazu-words.json`, `scripts/audit-word-bank.mjs`, `THEMATIC PACKS/`)
- Finish the demo-alarm exit affordance and commit it
- Configure RevenueCat properly and run one real sandbox purchase
- Build the EAS dev build and install it on a real phone (notifications, audio, persistence all need real-device proof)
- Add a few automated tests — start with webhook signature checks and RLS policy checks
- Port the native floating tab bar (cheap, self-contained, no backend work)
- Rebuild Word Gym practice modes: review queue, roots drill, usage lab
- Wire up the Literary word pack (data already exists, needs seeding + gym screens)
- Build snooze properly (reschedule 5–10 min, no bonus if snoozed, one per morning)

## Later / backlog

- Word reroll (pick a different alarm word once a day)
- The other 8 thematic word packs — needs real word content written first, nothing to port
- Ad SDK integration (replace the mock ad card)
- Analytics + crash reporting
- Coin shop — wait until there's a real item to spend coins on

## Not doing

- The old copy's icon fallback component — conflicts with the icon migration already shipped
- Porting the old coin shop screen as-is — it's a placeholder with nothing to buy
