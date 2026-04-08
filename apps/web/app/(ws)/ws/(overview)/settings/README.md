# Settings

Organization settings surfaces under the overview shell.

- Canonical route: `/ws/settings` with tab query state:
  - `/ws/settings?tab=org`
  - `/ws/settings?tab=verification`
  - `/ws/settings?tab=members`
  - `/ws/settings?tab=apps`
  - `/ws/settings?tab=api-keys`
- `page.tsx`: unified tabbed settings page (organization + members/invites).
- `members/page.tsx`: legacy route redirected to `/ws/settings?tab=members`.
- `invite/page.tsx`: legacy route redirected to `/ws/settings?tab=members`.
- `_components/ApiKeysWorkspace/`: folder-backed API key workspace implementation behind the stable `ApiKeysWorkspace.tsx` entry.
