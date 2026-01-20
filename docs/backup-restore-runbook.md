# Backup & Restore runbook (Convex)

This runbook assumes **no guaranteed point-in-time restore** unless you have explicitly verified it in your Convex plan/dashboard. Treat `convex export` as your primary backup mechanism.

## Backup procedure (production)

Prereqs:
- Convex CLI configured for this project
- Access to production deployment
- Secure storage bucket (S3/GCS/Backblaze) with encryption-at-rest and access logging

1) Create an export snapshot:

```bash
mkdir -p backups
npx convex export --prod --path backups/convex-prod-$(date +%F_%H%M%S).zip
```

2) Upload the ZIP to your backup storage (encrypted).

3) Record metadata:
- timestamp
- git SHA deployed
- Convex deployment name
- who ran it / ticket link

Retention recommendation:
- daily backups, keep 30 days
- weekly backups, keep 6 months
- monthly backups, keep 12 months

## Restore procedure (safe, staged)

Do NOT restore directly into prod first.

1) Create or pick a **staging/preview** deployment to restore into.

2) Import the snapshot into staging:

```bash
npx convex import --deployment-name <stagingDeployment> backups/<snapshot>.zip --replace-all
```

3) Validate in staging:
- expected appointment counts
- spot-check random samples
- confirm booking UI works

4) Decide production approach:
- Preferred: keep prod stable, migrate data via controlled admin imports/migrations.
- If full restore is required: import into prod with `--replace-all` only with an approved incident runbook and maintenance window.

## Disaster recovery drill (quarterly)

1) Pick a recent backup ZIP.
2) Restore into staging/preview deployment.
3) Run validation checklist (counts + sampling).
4) Time the end-to-end process and document gaps.
5) Rotate who performs the drill.

