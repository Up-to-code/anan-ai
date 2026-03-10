# Configurable Agent Core

## Ownership
This folder owns the shared backend runtime for all AI agents.

## Responsibilities
- Build agents from declarative definitions.
- Merge shared tool bundles with agent-local tools.
- Generate structured prompts from prompt definitions.
- Apply shared runtime policy for retries, fallback models, and analytics.

## Rules
1. New production agents should be definitions plus prompt/tool bundles, not custom runtime classes.
2. Global runtime behavior changes belong here, not in individual agent configs.
3. Token/model analytics must be emitted by the shared runtime only.
