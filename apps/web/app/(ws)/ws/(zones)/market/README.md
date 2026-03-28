# Workspace UI Zone: `market`

## Ownership And Purpose
This zone owns the workspace market-analysis experience under `/ws/market`: one overview hub plus focused deep-link routes for cities, hot areas, market results, and keyword research.

## Why This Zone Exists
Market is a presentation-heavy workspace zone built on shared market data. This folder keeps route wiring, exact-date filters, and market-only UI composition local while the data orchestration stays in server/backend layers.

## Architecture Overview
- `page.tsx`, `layout.tsx`: route entrypoints
- `MarketPage/`: primary market page module and focused route panels
- `loadMarketPageModel.ts`, `marketViewModel.ts`, `marketTypes.ts`: route-facing data shaping
- `MarketRouteTabs.tsx`: route navigation UI
- `areas/`, `cities/`, `opportunities/`, `research/`: focused route trees

## Flowchart
```mermaid
flowchart LR
  A["/ws/market route"] --> B["market route entrypoint"]
  B --> C["MarketPage + view model loader"]
  C --> D["server/backend market data path"]
  D --> E["Overview hub + focused market reports"]
```

## Stable Entrypoints
- `page.tsx`
- `MarketPage/index.tsx`
- `loadMarketPageModel.ts`
- `marketViewModel.ts`
- `marketTypes.ts`

## Outside-In Usage
Use this zone from workspace market routes only. If another zone needs market business data, use the server/backend contract instead of importing MarketPage internals. If another zone needs a generic chart/table primitive, extract it intentionally rather than coupling to a market page component.

## Allowed And Forbidden Imports
- Allowed: shared workspace UI, route-local market components, server/backend market loaders
- Forbidden: unrelated route zones importing market page components as shared building blocks
- Forbidden: market route files owning backend orchestration directly

## Dependency Map
- Upstream consumers: `/ws/market` and nested market routes
- Downstream dependencies: market page model loader, server/backend market contracts, local market report components

## Common Extension Tasks
- Add a new market panel: place it under `MarketPage/` and keep route files thin
- Add a new derived field or filter: start in `loadMarketPageModel.ts` or `marketViewModel.ts`
- Add a new deep-link report: keep `/ws/market` as the overview hub and add the focused route beside the existing market routes
