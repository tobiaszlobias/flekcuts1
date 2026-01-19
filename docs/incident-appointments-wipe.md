# Incident: `appointments` table wiped after retention cron

## Summary

The Convex cron job `cleanupOldAppointments` ran shortly before the `appointments` table became empty. At the time of the incident, the cleanup mutation could delete large numbers of rows without any kill switch, dry-run, or per-run cap.

## Evidence (code/history)

- The retention cron was introduced and scheduled to run every 24 hours:
  - `convex/crons.ts:7`
  - Introduced in commit `8d691ac` (see `git show 8d691ac:convex/crons.ts`).

- The cleanup mutation was introduced without a kill switch and deleted all rows matching its filters:
  - Introduced in commit `8d691ac` (see `git show 8d691ac:convex/appointments.ts` → `cleanupOldAppointments`).
  - It queried all eligible documents via `.collect()` and deleted them in a loop.
  - It also contained a fallback path that could delete “legacy” rows based on `date` + computed start time.

## Suspected trigger (facts only)

Given the timing (cron ran successfully shortly before the wipe) and the cleanup logic that performed unbounded deletions, the most likely mechanism is that `cleanupOldAppointments` deleted far more rows than intended.

What could expand the eligible set:
- Incorrect/unstable conversion from Prague local `(date,time)` to UTC epoch milliseconds (so future appointments may appear “old”).
- Presence of many rows meeting the cutoff due to missing/incorrect `appointmentStartMs`, combined with the fallback deletion path.

## Containment/guardrails added

The cleanup is now **safe-by-default** and will not delete anything unless explicitly enabled:
- `convex/appointments.ts`:
  - Requires `RETENTION_ENABLED === "true"` to do anything destructive.
  - Defaults to `RETENTION_DRY_RUN=true` unless set to `"false"`.
  - Caps deletions with `RETENTION_MAX_DELETE` (default `10`).
  - Never deletes rows without a valid numeric `appointmentStartMs`.
  - Never deletes future appointments.
  - Logs the candidate ids/startMs range during dry-run.
- A legacy fallback deletion path was removed; legacy rows must be backfilled first.

## Follow-up

If you intend to re-enable retention:
- Use `docs/retention.md`.
- Enable in **DEV first** with dry-run logs, then enable deletes only after verifying the candidates are correct.

