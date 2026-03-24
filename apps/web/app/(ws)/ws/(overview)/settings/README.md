# Settings

Organization settings surfaces under the overview shell.

- Canonical route: `/ws/settings` with tab query state:
  - `/ws/settings?tab=org`
  - `/ws/settings?tab=members`
  - `/ws/settings?tab=api-keys`
- `page.tsx`: unified tabbed settings page (organization + members/invites).
- `members/page.tsx`: legacy route redirected to `/ws/settings?tab=members`.
- `invite/page.tsx`: legacy route redirected to `/ws/settings?tab=members`.
