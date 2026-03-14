This folder contains the `/ws/market` page UI.

- `index.tsx`: shared market route frame with brand header, stat strip, filters, and empty-state handling.
- `MarketOverviewPreview.tsx`: blurred market landing-page preview shown behind the coming-soon state.
- `MarketUnderDevelopmentOverlay.tsx`: centered under-development message for the market root page.
- `MarketFilters.tsx`: URL-based city/area/window filter form that stays on the active market route.
- `CitiesTab.tsx`: SSR city comparison report.
- `AreasTab.tsx`: SSR area comparison report.
- `OpportunitiesTab.tsx`: SSR ranked opportunity analysis from demand and supply gaps.
- `ResearchKeywordsTab.tsx`: SSR keyword and topic analysis with latest research.
- `MarketCitiesTable.tsx`: reusable city-level demand and inventory table.
- `MarketAreasTable.tsx`: reusable area-level demand and supply table.
- `MarketOpportunityTable.tsx`: reusable recommendation table for opportunities.
- `MarketKeywordTable.tsx`: reusable keyword/topic table.
- `MarketMiniBarChart.tsx`: compact inline chart used by the analysis tabs.
- `MarketSellingPoints.tsx`: top selling-point list for the selected scope.
- `MarketLatestResearch.tsx`: latest persisted market research card.
- `MarketEmptyState.tsx`: honest empty state when the selected scope has insufficient signal.

Rules:
- Keep this page practical and data-backed.
- Do not add decorative charts, mock previews, or unsupported market claims.
- Route category switching belongs to the market zone layout, not local component state.
- Keep the main analysis routes server-rendered unless a real interaction requires client state.
- Keep route-specific components inside this folder.
