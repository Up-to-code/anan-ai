# AG Unit Create Form

## Purpose
This folder owns the standalone unit creation wizard used by `/ws/projects/create/unit`.

## Responsibilities
- Keep standalone unit UI and motion separate from the project dossier wizard.
- Submit Anan-compatible `UnitCreateFormData` only; server routes perform persistence.
- Reuse workspace design tokens and local AG UI controls.

## Boundaries
- Do not call Convex directly from this form.
- Do not add project-zone business logic here.
- Keep route orchestration in the projects zone.
