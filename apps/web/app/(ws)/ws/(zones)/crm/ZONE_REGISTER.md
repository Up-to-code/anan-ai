# Workspace UI `crm` Register

## Top-Level Ownership
- route files: `page.tsx`, `layout.tsx`, `loading.tsx`, nested route wrappers
- `pages/*`: page modules and page-private UI
- `shared/navigation`: route navigation
- `shared/forms`: shared CRM form UI
- `shared/lib`: deal-to-page mapping helpers
- `types`: zone types
- `clients/` and `brokers/`: nested route trees

## Important Exports
- `CrmPage`, `ClientsPage`, `ClientDetailPage`
- `mapDealToCrmClientRecord`, `collectCrmProjects`
- `PipelineStage`, `CrmClientRecord`, related CRM types

## Main Consumers
- CRM route entry files
- page-local tests

## Public Vs Internal
- Public inside the zone: `pages/`, `shared/`, and `types/`
- Internal: nested route implementation details and local page-specific subcomponents
