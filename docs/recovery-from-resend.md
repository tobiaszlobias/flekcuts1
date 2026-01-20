# Recovery from Resend exports (best-effort)

This runbook reconstructs appointment candidates from **Resend CSV exports** (Logs/Emails). It cannot recover phone numbers unless they were present in the email content.

## 0) Safety notes

- Reconstruction is “best-effort”: some rows may be missing `service/date/time` depending on what Resend includes in the export.
- The import mutation is **admin-only** and **does not delete anything**.
- Always test in **DEV** first.

## 1) Export CSV from Resend

In the Resend dashboard:
- Export the Emails/Logs list as CSV (use the Resend UI export for the relevant period).
- Save the file locally as either:
  - `recovery/resend-logs.csv`, or
  - `recovery/resend-emails.csv`

## 2) Generate reconstructed JSON

The parser is TypeScript. Compile just this script and run it:

```bash
mkdir -p recovery
npx tsc scripts/resend_recover_parse.ts --target ES2022 --module commonjs --outDir recovery/tmp --esModuleInterop
node recovery/tmp/resend_recover_parse.js recovery/resend-logs.csv
```

Output:
- `recovery/reconstructed-appointments.json`

If the script reports many rows missing core fields, open the JSON and spot-check whether the CSV export includes email body content. If not, you may need a different export view from Resend that includes `text`/`html`.

## 3) Import into Convex (DEV first)

In Convex Dashboard (DEV deployment):
- Open the “Functions” / “Run function” UI.
- Run mutation: `appointments:importReconstructedAppointments`
- Provide an argument object:

```json
{
  "items": [ /* paste a chunk from reconstructed-appointments.json */ ],
  "dryRun": true,
  "maxInsert": 200,
  "confirmToken": "<<< set RECOVERY_IMPORT_CONFIRM_TOKEN and paste it here >>>"
}
```

Notes:
- Import in **small chunks** (e.g. 50–200 items at a time).
- The mutation will:
  - skip invalid items (missing email/date/time/service/name),
  - skip duplicates (same `customerEmail` + `date` + `time` + `service`),
  - create appointments as `userId="anonymous"` and `status="pending"`.
- First run with `dryRun: true` and verify the summary; only then set `dryRun: false`.

## 4) Verify

In Convex Dashboard (DEV):
- Data → `appointments`: confirm rows exist and spot-check fields.

If DEV looks correct, repeat the import steps on the PROD deployment.
