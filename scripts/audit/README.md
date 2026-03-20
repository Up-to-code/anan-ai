# Repo Audit Scripts

This folder contains helper scripts used to generate objective audit artifacts.

## Generate Hotspot Tables

```bash
node scripts/audit/analyze.mjs
```

Outputs:
- `output/audit/analysis.json` — machine-readable findings (functions, nesting, pattern matches)
- `output/audit/tables.md` — Markdown tables intended to be pasted into `AUDIT.md`

