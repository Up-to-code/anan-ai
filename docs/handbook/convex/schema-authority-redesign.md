# Schema Authority Redesign

## Purpose

Anan's schema must scale as a real-estate infrastructure layer, not a single dashboard. The durable rule is: authentication proves identity, profile role describes marketplace identity, and platform access is explicit metadata or organization membership.

## Authority Model

- Better Auth owns authentication and sessions only.
- `userProfiles.role` is business-only: `user`, `broker`, `developer`.
- Platform control-plane access lives in `userProfiles.metadata.platformAccess.admin`.
- Broker/developer operational access belongs to tenant ownership and organization membership records.
- Admin entrypoints must use `requireAdminAccess`; business zones must use `requireRole`.

## Schema Blueprint

- Identity: keep person data in `userProfiles`, auth accounts in Better Auth, and channel users in `users` until channel identity is consolidated.
- Organizations: make `tenantOrgLinks` the canonical bridge between Better Auth organizations and broker/RED domain owners; phase out legacy team invite/membership tables after migration.
- Properties: keep hot listing cards small; move units, payment plans, media, compliance, and search documents into focused tables or indexed projections.
- Analytics: write raw append-only events, then serve dashboards from hourly/daily rollups instead of multi-table scans.
- AI: separate transcripts, stream events, orchestration traces, token usage, durable memory, short-term signals, RAG documents, and approved knowledge.
- Metadata: avoid `v.any()` in hot-path records; use typed, bounded, versioned objects and promote indexed fields when they become query requirements.

## Migration Rules

- Add new typed fields before removing legacy readers.
- Backfill legacy rows idempotently.
- Keep read paths dual-compatible for one release window.
- Remove legacy role/admin fallbacks only after production data health confirms no `role: "admin"` profiles remain.
