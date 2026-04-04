# Workspace UI `offers` Audit

## Current Boundary Risks
- `pages/OfferDetailPage/index.tsx` and `shared/forms/CreateOfferForm.tsx` are still the largest local UI modules.
- This zone has many route variants, so filter/view-model logic can sprawl if it is not kept in `shared/lib`.

## SOLID Findings
- The hybrid bucket pattern fits this zone well: route files stay thin, page ownership stays clear, and cross-page helpers have an explicit home.
- The next likely pressure point is splitting large detail/form UI into smaller page-private pieces without promoting them too early into `shared/`.

## Cleanup Decisions In This Pass
- Moved page modules into `pages/`.
- Moved reusable list, form, copy, and pagination pieces into `shared/`.
- Moved route-facing offer types into `types/`.

## Deferred Follow-Ups
- Split `pages/OfferDetailPage/index.tsx` or `shared/forms/CreateOfferForm.tsx` further if more behavior lands there.
