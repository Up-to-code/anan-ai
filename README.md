# anan-lit

New project cloned from anan. Architecture: Ingress → Middleware → Channels (per-channel auth) → Processing → Agent → Response.

## Setup

```bash
cd anan-lit
npm install
npx convex dev   # Creates deployment, generates _generated/, starts dev server
```

After `npx convex dev`, the `_generated/` folder will be created and Convex components (agent, rate-limiter, workflow, etc.) will be available.

## Structure

- `convex/lib/core/` – Logger + utilities (logger, utilities, errors)
- `convex/lib/middleware/` – rateLimit, auth, channelDetect
- `convex/channels/rules/` – whatsapp.rules
- `convex/channels/whatsapp/preprocess/` – voicePipeline, textPipeline
- `convex/agents/runtime/` – agentApi, instructionBuilder
- `convex/agents/anan-lit/` – Main agent, tools
- `convex/agents/actions/` – generation, thread, message
- `convex/agents/scraping/` – stagehand, genericScraper, config
- `convex/services/` – users (ensureWhatsAppUser)
- `convex/workflows/` – Re-export placeholder

## Plan

See `anan-lit_complete_plan_435416d4.plan.md` and `.cursor/rules/anan-lit-agent.mdc`.
