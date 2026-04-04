# Workspace UI `crm` Audit

## Current Boundary Risks
- `pages/PipelinePage/PipelineWorkspace.tsx` is one of the larger UI orchestrators in the zone.
- Nested routes can still drift into ad hoc local logic if shared form or mapping behavior leaks out of `shared/`.

## SOLID Findings
- The new layout keeps page ownership clear while giving navigation, form, and mapping logic explicit shared homes.
- The biggest future cleanup target is splitting larger page workspaces into smaller local subcomponents/hooks without flattening them into generic shared buckets.

## Cleanup Decisions In This Pass
- Moved page modules into `pages/`.
- Moved tabs into `shared/navigation`, forms into `shared/forms`, mapping into `shared/lib`, and types into `types/`.

## Deferred Follow-Ups
- Split `pages/PipelinePage/PipelineWorkspace.tsx` further if new interaction logic lands there.
