# Workspace UI `crm` Register

## Top-Level Ownership
- `page.tsx`, `layout.tsx`, `loading.tsx`: route entrypoints
- `CrmPage/`, `ClientsPage/`, `ClientDetailPage/`, `PipelinePage/`: page modules
- `crmViewModel.ts`: deal-to-page mapping helpers
- `crmTypes.ts`: zone types
- `CrmRouteTabs.tsx`: route navigation
- `clients/` and `brokers/`: nested route trees

## Important Exports
- `CrmPage`, `ClientsPage`, `ClientDetailPage`
- `mapDealToCrmClientRecord`, `collectCrmProjects`
- `PipelineStage`, `CrmClientRecord`, related CRM types

## Main Consumers
- CRM route entry files
- page-local tests

## Public Vs Internal
- Public inside the zone: page folders and `crmViewModel.ts`
- Internal: nested route implementation details and local page-specific subcomponents
