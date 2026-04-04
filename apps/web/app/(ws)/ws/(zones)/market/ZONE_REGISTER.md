# Workspace UI `market` Register

## Top-Level Ownership
- route files: `page.tsx`, `layout.tsx`, nested route wrappers
- `pages/MarketPage`: market overview, tabs, tables, and charts
- `shared/navigation`: route navigation
- `shared/lib`: route data loader and snapshot-to-page mapping
- `types`: route-facing types
- `fixtures`: mock-only market snapshot data
- `areas/`, `cities/`, `opportunities/`, `research/`: focused route trees

## Important Exports
- `MarketPage`
- `loadMarketPageModel`
- `mapMarketSnapshotToPageModel`
- route-facing market types from `marketTypes.ts`

## Main Consumers
- market route entry files
- nested market route wrappers

## Public Vs Internal
- Public inside the zone: `pages/`, `shared/`, `types/`, and `fixtures/`
- Internal: individual page widgets under `pages/MarketPage/`
