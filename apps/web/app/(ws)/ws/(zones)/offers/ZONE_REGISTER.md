# Workspace UI `offers` Register

## Top-Level Ownership
- route files: `page.tsx`, `layout.tsx`, `loading.tsx`, nested route wrappers
- `pages/*`: page orchestrators and page-private UI
- `shared/components`: cross-page cards and pagination controls
- `shared/forms`: cross-route offer form UI
- `shared/lib`: route-facing mapping/filter/pagination helpers
- `shared/copy`: offer-local copy helpers
- `types`: route-facing offer types
- `create/`, `search/`, `[offerId]/`, `brokers/`, `developers/`: focused route trees

## Important Exports
- page entrypoints under `pages/*/index.tsx`
- `CreateOfferForm`
- `mapPropertyToOfferOption`, `buildClientRequirementViewModel`
- pagination/search helpers from `shared/lib/offersPageData.ts`
- route-facing offer types from `types/offerTypes.ts`

## Main Consumers
- offer route entry files
- create/search/detail/profile route wrappers

## Public Vs Internal
- Public inside the zone: `pages/`, `shared/`, and `types/`
- Internal: nested route wrappers and page-private subcomponents inside each `pages/*` folder
