# `_core` Zone Audit

## Current Boundary Risks
- `_core/oauth/http.ts` is a large mixed-responsibility module and is the clearest future split target.
- `_core` currently has a small dependency bridge into `shared_logic` validators/profile helpers, which is acceptable today but should stay tightly limited.

## SOLID Findings
- Single-responsibility pressure is concentrated in OAuth HTTP handling, not in schema/security ownership itself.
- `_core` already has strong ownership boundaries; the main need is documentation and continued discipline around not adding business handlers here.

## Cleanup Decisions In This Pass
- Keep `_core` local and explicitly document it as infrastructure-only.
- Do not add a synthetic barrel here; the stable surfaces are `schema/`, `security/`, and `oauth/`.

## Deferred Follow-Ups
- Split `oauth/http.ts` into request parsing, provider dispatch, and response formatting modules.
- Revisit whether validator/profile bridges currently imported from `shared_logic` should become `_core` primitives.
