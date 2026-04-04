# Workspace UI `projects` Audit

## Current Boundary Risks
- `pages/ProjectsPage/ProjectsWorkspace.tsx` is already fairly large and may continue growing.
- Create/edit flows are healthy, but the shared form path needs discipline so it does not turn into a second page layer.

## SOLID Findings
- The hybrid bucket layout is a good fit here: shared form behavior is explicit, while list/detail/analytics pages keep their own local ownership.
- The main future risk is letting route wrappers or `shared/forms` absorb unrelated page behavior.

## Cleanup Decisions In This Pass
- Moved page modules into `pages/`.
- Moved shared form and submission helpers into `shared/forms`.
- Moved route-facing mapping into `shared/lib` and project types into `types/`.

## Deferred Follow-Ups
- Split `pages/ProjectsPage/ProjectsWorkspace.tsx` or `shared/forms/ProjectFormScreen.tsx` further if more interaction/state logic lands there.
