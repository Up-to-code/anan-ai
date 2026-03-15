# Runtime and Orchestration Pipeline

## High-Level Flow (Public Assistant)

```mermaid
flowchart LR
  UI["UI or Channel"] --> Ctrl["assistant.ts"]
  Ctrl --> Svc["assistantService.ts"]
  Svc --> Orc["agents/anan/orchestrate.ts"]
  Orc --> Intent["intentAnalyzer.ts"]
  Orc --> Teams["teamRegistry.ts"]
  Teams --> AgentRun["BaseConfiguredAgent"]
  AgentRun --> Tools["Tool factories"]
  AgentRun --> LLM["providers.getChatModel"]
  Orc --> Merge["resultMerger.ts"]
  Svc --> DB["assistantThreads + assistantMessages"]
  Svc --> Usage["aiTokenUsage + aiOrchestrationUsage"]
```

## High-Level Flow (Workspace Assistant)

```mermaid
flowchart LR
  UI["Workspace UI"] --> Ctrl["assistantWorkspace.ts"]
  Ctrl --> Svc["assistantService.ts"]
  Svc --> Orc["agents/anan_workspace/orchestrate.ts"]
  Orc --> Intent["intentAnalyzer.ts"]
  Orc --> Teams["teamRegistry.ts"]
  Teams --> AgentRun["BaseConfiguredAgent"]
  AgentRun --> LLM["providers.getChatModel"]
  Orc --> Merge["resultMerger.ts"]
  Svc --> AgUi["services/agUi.ts"]
  Svc --> DB["assistantThreads + assistantMessages"]
```

## Agent Execution Pipeline

```mermaid
flowchart TD
  Def["AgentDefinition"] --> Prompt["promptPolicy.buildSystemPrompt"]
  Prompt --> Tools["toolRegistry.resolveTools"]
  Tools --> Call["cachedGenerateText"]
  Call --> Retry["errorHandler.withRetry"]
  Call --> Track["tokenTracker.trackTokenUsage"]
  Retry --> Fallback["Fallback model"]
```

## Key Runtime Guarantees

- Orchestrators only select teams and merge outputs.
- Agents are the only place tool calls happen.
- Retry, fallback, and token tracking are centralized.
- Workspace and public orchestration are isolated by config and runtime.
