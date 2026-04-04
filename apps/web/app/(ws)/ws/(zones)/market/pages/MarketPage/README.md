This folder contains the rebuilt `/ws/market` workspace UI.

- `index.tsx`: shared route frame with header, stat strip, exact-date filters, and empty-state handling.
- `OverviewTab.tsx`: unified market overview hub shown at `/ws/market`.
- `CitiesTab.tsx`, `AreasTab.tsx`, `OpportunitiesTab.tsx`, `ResearchKeywordsTab.tsx`: focused deep-link routes.
- `MarketPanel.tsx`: consistent section shell for the rebuilt market UI.
- `MarketResultsSummary.tsx`: structured summary of the selected date range and scope.
- `MarketCitiesTable.tsx`, `MarketAreasTable.tsx`, `MarketOpportunityTable.tsx`, `MarketKeywordTable.tsx`: SSR-first report tables with light inline visuals only where helpful.
- `MarketLatestResearch.tsx`: latest saved research for the current scope and period.
- `MarketSellingPoints.tsx`: repeated selling-point evidence for the current scope.
- `MarketFilters.tsx`: URL-backed city/area/query/date filter form.
- `MarketEmptyState.tsx`: honest empty state when the selected scope has insufficient signal.

Rules:
- Keep the experience table-first and SSR-first unless real interaction requires client state.
- Do not restore preview, under-development, or blurred-overlay UI.
- Favor plain product UI over decorative dashboards.
- Keep market-only sections inside this folder.
