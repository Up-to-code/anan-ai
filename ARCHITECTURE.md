# Anan Platform: Architecture & Standards

Welcome to the Anan Real Estate Platform. This document outlines the absolute architectural rules that **must** be followed by both human developers and AI assistants. 

**CRITICAL:** Do NOT search the old legacy codebase for architecture patterns. Use ONLY the patterns described below.

---

## 1. Documentation Standards

Every single Orchestrator page, API hook, and major utility function in this repository **MUST** be documented with the following strict `WHY/WHAT/HOW` format:

```typescript
/**
 * WHY:   Explains the business or architectural reason this module exists.
 * WHAT:  Explains exactly what this module does or returns.
 * HOW:   Explains the mechanics, dependencies, and design patterns used.
 */
export function ComplexModule() { ... }
```
*If an AI generates code without this block, reject the code.*

---

## 2. Frontend: Deep Dive into the "Fortress Concept"

The frontend (`dashboard/src/`) is broken down into strictly isolated zones:
- `admin_zone`
- `broker_zone`
- `red_zone` (Real Estate Developers)
- `public_zone`
- `shared_logic` (Common UI, Layouts, Utilities)

### The 4 Rules of a Fortress:

1. **The API Gateway (`index.ts`)**
   Every zone has a root `index.ts`. If a component, boundary, or page needs to be accessed outside the zone (e.g., in `App.tsx`), it **MUST** be exported from this `index.ts`. No other zone is allowed to deep-import.
   *Example: `import { BrokerOverview } from "@/broker_zone"` is correct. `import { BrokerOverview } from "@/broker_zone/pages/Overview"` is WRONG.*

2. **API Isolation (`api/`)**
   All data fetching (Convex queries, mutations) happens in the `api/` directory (e.g., `api/useBrokerData.ts`). Do not put hooks inside `/hooks` or scattered inside components. 

3. **Error Vaults (`errors/ErrorBoundary.tsx`)**
   Each zone has a dedicated React Error Boundary (e.g., `BrokerZoneErrorBoundary`). In `App.tsx`, the router for the specific zone must be completely wrapped in its respective Error Vault. This ensures a broken broker page doesn't crash the admin dashboard.

4. **The Orchestrator Pattern (`pages/`)**
   We do not use monolithic pages (`Overview.tsx`). All pages are folders (`pages/Overview/index.tsx`).
   - The `index.tsx` is the **Orchestrator**. It fetches data from the `api/` hooks and passes it down.
   - It contains minimal markup, delegating UI rendering to smaller components inside `pages/Overview/components/` or `shared_logic/`.

#### Folder Structure Example:
```text
broker_zone/
├── index.ts                     <-- The Gateway
├── errors/
│   └── ErrorBoundary.tsx        <-- The Vault
├── api/
│   └── useBrokerData.ts         <-- Data Fetching
└── pages/
    └── CRM/
        ├── index.tsx            <-- The Orchestrator
        └── components/
            └── DealBoard.tsx    <-- Pure UI
```

---

## 3. Backend: The Multi-Agent Orchestrator

The AI backend (`convex/ai_zone/agents/`) has been completely refactored from a single monolith into a hierarchical Multi-Agent system. 

### The Brain (`anan/`)
The `anan` directory is the master orchestrator. When the frontend requests AI assistance via `assistantService.ts`, it calls `anan.orchestrate()`.

```mermaid
sequenceDiagram
    participant User
    participant AssistantService
    participant Orchestrator (anan)
    participant IntentAnalyzer
    participant Team (e.g., team_search)
    
    User->>AssistantService: "Find properties"
    AssistantService->>Orchestrator: orchestrate(prompt)
    Orchestrator->>IntentAnalyzer: analyzeIntent(prompt)
    IntentAnalyzer-->>Orchestrator: Requires: anan_search
    Orchestrator->>Team: dispatch(anan_search, prompt)
    Team-->>Orchestrator: Real estate data
    Orchestrator->>User: Merged Markdown Response
```

### The Teams & Agents
Agents are separated into discrete "Teams". Each team has specialized agents capable of specific tools.

1. `team_search`: `anan_search`, `anan_web`
2. `team_property`: `anan_property`, `anan_recommender`
3. `team_finance`: `anan_finance`, `anan_banks`
4. `team_knowledge`: `anan_knowledge`, `anan_memory`
5. `team_trainer`: `anan_trainer`

### Adding a New Agent
1. Create a folder in the relevant team: `team_X/anan_new_agent/`.
2. Create `config.ts` wrapping the `AnanAgent` base class (found in `shared/AnanAgent.ts`).
3. Define the LLM Prompt, required Tools, and Model.
4. If it requires new tools, add them to `team_X/tools/`.
5. Register the agent inside `anan/teamRegistry.ts`.

### Shared Infrastructure
Always utilize the files in `ai_zone/agents/shared/`:
- `errorHandler.ts`: Wrap external calls for exponential backoff and jitter.
- `tokenTracker.ts`: Record prompt/completion dimensions per agent request accurately.
- `ragInstances.ts`: Use pre-configured RAG vectors rather than building raw queries.

---

## 4. Coding Golden Rules

- **Zero TypeScript Errors:** Do not commit `// @ts-ignore` or `any` unless absolutely forced by external libraries. Type your data structures.
- **Never mutate state directly:** Always use immutable updates.
- **Small functions:** An orchestrator file should rarely exceed 150-200 lines. If it does, abstract the UI into sub-components.
- **Follow the Breadcrumbs:** When assigned a task, look at the `ZONE_README.md` and read the `index.ts` gateway first to understand the landscape. Do not barge in and create files anywhere.
