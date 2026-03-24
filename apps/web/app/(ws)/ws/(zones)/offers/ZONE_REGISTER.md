# Workspace UI `offers` Register

## Top-Level Ownership
- `page.tsx`, `layout.tsx`, `loading.tsx`: route entrypoints
- `OfferOverviewPage/`, `OfferProfilesPage/`, `OfferDetailPage/`, `OfferDirectoryPage/`: page modules
- `CreateOfferForm.tsx`, `OfferCards.tsx`, `OfferPaginationNav.tsx`, `OffersTabs.tsx`: local UI primitives
- `offerViewModel.ts`, `offerTypes.ts`, `offersPageData.ts`: route-facing data helpers
- `create/`, `search/`, `[offerId]/`, `brokers/`, `developers/`: focused route trees

## Important Exports
- `OfferOverviewPage`, `OfferProfilesPage`, `OfferDetailPage`, `OfferDirectoryPage`
- `mapOfferToMarketplaceItem`, `mapPropertyToOfferOption`
- pagination/search helpers from `offersPageData.ts`
- route-facing offer types from `offerTypes.ts`

## Main Consumers
- offer route entry files
- create/search/detail/profile route wrappers

## Public Vs Internal
- Public inside the zone: page folders, local view models/types, route-facing helpers
- Internal: nested route wrappers and page-specific local components
