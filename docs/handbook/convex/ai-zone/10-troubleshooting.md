# Troubleshooting

## Missing OpenRouter API Keys

Symptoms:
- Orchestrator returns a message saying the API key is missing.

Checks:
- `OPENROUTER_API_KEY` for public assistant.
- `OPENROUTER_WORKSPACE_API_KEY` for workspace assistant.

Locations:
- `convex/ai_zone/agents/config.ts`

## Tool Key Not Registered

Symptoms:
- Runtime error: tool key not registered in tool catalog.

Checks:
- Ensure `TOOL_CATALOG` includes the tool key.
- Ensure the agent uses `toolKeys` and not a misspelled string.

Locations:
- `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- `convex/ai_zone/agents/core/registry.ts`

## No Agents Dispatched

Symptoms:
- Orchestrator returns a generic failure message.

Checks:
- Intent analyzer is returning no teams.
- Role gating excludes all teams.
- Agents list for a team is empty.

Locations:
- `convex/ai_zone/agents/anan/intentAnalyzer.ts`
- `convex/ai_zone/agents/anan/teamRegistry.ts`

## Workspace UI Cards Not Appearing

Symptoms:
- Assistant responds but no UI cards show in workspace.

Checks:
- `assistantService.ts` must attach `metadata.uiTurn`.
- `services/agUi.ts` must return a valid UI turn.

Locations:
- `convex/ai_zone/services/assistantService.ts`
- `convex/ai_zone/services/agUi.ts`

## WhatsApp Replies Missing

Symptoms:
- Webhook receives messages but users do not receive replies.

Checks:
- `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`.
- Network errors in WhatsApp service.

Locations:
- `convex/ai_zone/channels/whatsapp/service.ts`
- `convex/ai_zone/channels/whatsapp/webhook.ts`
