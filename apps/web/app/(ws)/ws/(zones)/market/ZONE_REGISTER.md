# Workspace UI `market` Register

## Top-Level Ownership
- `page.tsx`, `layout.tsx`: route entrypoints
- `MarketPage/`: market overview/tabs/tables/charts
- `loadMarketPageModel.ts`: route data loader
- `marketViewModel.ts`: snapshot-to-page mapping
- `marketTypes.ts`: route-facing types
- `MarketRouteTabs.tsx`: route navigation
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
- Public inside the zone: `MarketPage`, loader, view model, types
- Internal: individual page widgets under `MarketPage/`
