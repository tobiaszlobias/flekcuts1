# Data retention (Convex)

The Convex cron job `cleanupOldAppointments` runs every 24 hours, but **it is a NO‑OP by default**.

Deletion only runs when all of these are true:
- `RETENTION_ENABLED === "true"`
- `RETENTION_DRY_RUN === "false"` (dry-run is default)
- Only rows with a valid numeric `appointmentStartMs` are eligible
- Only rows with `appointmentStartMs < (now - 24h)` are eligible
- **Future appointments are never deleted**
- Deletions are capped by `RETENTION_MAX_DELETE` (default `10`)

## Enabling safely

1) In the Convex Dashboard, select the deployment you want (DEV first).
2) Set environment variables:
- `RETENTION_ENABLED=true`
- Keep `RETENTION_DRY_RUN=true` for the first run(s).
- Optionally set `RETENTION_MAX_DELETE=10` (or smaller).
3) Watch logs for the dry-run output (`Retention dry-run ids`) to confirm only expected rows are eligible.
4) Only then set:
- `RETENTION_DRY_RUN=false`

## Backfilling legacy rows

Retention cleanup will **not** delete rows missing `appointmentStartMs`.

Use the admin-only mutation `appointments:backfillAppointmentStartMs` in small batches until legacy rows are filled.

