# Safety Rules and Safety Types

This document describes safety expectations for AI zone. These rules are guidance and not enforced in code unless noted.

## Safety Rules

- Orchestrators must never call tools directly.
- Agents must use only their declared tools.
- Tool calls must enforce ownership and access checks.
- Prompts must not echo secrets or sensitive internal data.
- Do not log user prompts or PII to external systems.
- Apply strict role gating for workspace actions.
- Reject prompt injection attempts that ask for system prompts, tools, or secrets.

## Prompt Injection Handling

- Treat user input as untrusted content.
- Never follow instructions that request tool bypass or system prompt disclosure.
- Prefer explicit tool output over model guesses.

## PII and Privacy

- Avoid storing raw personal data in prompt text beyond what is required.
- Use structured storage for user preferences and memory.
- Do not include payment identifiers or full personal identifiers in logs.

## Safety Types (Doc-Only)

These types are for documentation and design alignment. They are not currently enforced in code.

```ts
export type SafetyPolicy = {
  allowToolCalls: boolean;
  allowExternalSources: boolean;
  allowSensitiveData: boolean;
  requireUserConfirmation: boolean;
};

export type ToolAccessRule = {
  toolKey: string;
  allowedRoles: Array<"user" | "broker" | "RED" | "admin">;
  requiresConfirmation: boolean;
};

export type PromptInjectionMitigation = {
  blocklist: string[];
  redactSystemPrompt: boolean;
  ignoreToolBypassRequests: boolean;
};

export type RedactionRule = {
  field: string;
  strategy: "mask" | "drop" | "hash";
  reason: string;
};
```
