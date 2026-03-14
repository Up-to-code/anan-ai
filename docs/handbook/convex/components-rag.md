# Components + RAG (Agentic Architecture)

---

## WHY

Agentic systems become fragile when:

- prompt context grows without boundaries,
- tools bypass access checks,
- teams/agents are dispatched unnecessarily,
- retrieval is implemented as scans.

Convex supports component-style packages (e.g., `@convex-dev/rag`) and strong backend patterns for agentic systems.

---

## WHAT

Guidance for:

- keeping agent runtime generic and tools domain-safe,
- retrieval patterns (RAG / knowledge pages) that avoid scans,
- separating “product knowledge” from “developer handbook knowledge”.

---

## HOW (Repo-aligned rules)

### 1) Separate knowledge domains

We maintain multiple knowledge “types”:

- product/company content (`knowledgePages`),
- developer handbook content (rules, architecture, best practices).

Rule: never mix these sources unless explicitly intended and role-gated.

Current repo implementation:

- `knowledgePages` (product knowledge) lives in `convex/_core/schema/knowledge.ts`.
- `developerHandbookPages` (developer knowledge) lives in `convex/_core/schema/knowledge.ts` and is retrieved via `convex/shared_logic/developerHandbook/index.ts`.

### 2) RAG namespaces and tool boundaries

Agents can use a RAG namespace (example: `ragNamespace: "production"` in the knowledge agent).

Rules:

- orchestrator selects agents; agents call tools,
- tools enforce access,
- retrieval uses indexes/search indexes, not scans.

### 3) Official references

- Convex docs: https://docs.convex.dev/
- RAG component (package): https://www.npmjs.com/package/@convex-dev/rag
