# AssistantPage

## Purpose
This folder owns the dedicated public voice-first assistant experience for `apps/main-assistant`.

## Structure
- `index.tsx`: thin server orchestrator that loads the optional guest thread.
- `PublicAssistantClient.tsx`: client-side conversation runtime, transcript layout, voice capture, text fallback, and TTS playback.
- `actions.ts`: server actions bridging the UI to the future `ai_zone/assistantPublic` Convex surface.

## Rules
- Keep the route entrypoint thin.
- Preserve the prompt-input composition pattern already used by the web assistant.
- Do not move business logic into generic shared folders unless another app starts consuming it.

## Dev Notes
- Mobile microphone testing must use a secure origin. Run `pnpm --dir apps/main-assistant dev:https` and open the HTTPS URL on the device.
- The public assistant must remain usable when voice is blocked, so keep text input available as the fallback path.
