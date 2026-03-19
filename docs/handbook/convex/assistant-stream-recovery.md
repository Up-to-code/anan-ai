# Assistant Stream Schema Recovery Runbook

Use this when `assistantStreamEvents` rows fail schema validation after a stream-event contract change.

## Recovery Sequence

1. Deploy a compatibility schema/function version.
2. Purge malformed stream rows.
3. Verify zero remaining malformed rows.
4. Re-deploy strict schema.

## Commands

```bash
# 1) Push compatibility code first
npx convex dev --once

# 2) Dry-run purge
npx convex run ai_zone/assistantWorkspace:_purgeStreamEvents '{"mode":"all","batchSize":5000,"dryRun":true}'

# 3) Execute purge
npx convex run ai_zone/assistantWorkspace:_purgeStreamEvents '{"mode":"all","batchSize":5000,"dryRun":false}'

# 4) Verify no rows remain in selected mode
npx convex run ai_zone/assistantWorkspace:_purgeStreamEvents '{"mode":"all","batchSize":5000,"dryRun":true}'

# 5) Push strict schema code
npx convex dev --once
```

## Notes

- `mode="legacyOnly"` deletes only rows missing `eventType`.
- `mode="all"` clears the stream-event table for a clean reset.
- Keep this operation one-shot and avoid file churn while `convex dev --once` runs.
