# Recipe: Add a new channel adapter

---

## WHY

Channels are production ingress. They must be:

- secure,
- idempotent,
- thin at the edge,
- and delegated into stable backend services.

---

## WHAT

This recipe adds a new channel under:

`convex/ai_zone/channels/<channel>/`

and wires it into:

`convex/http.ts`

---

## HOW (Steps)

1. **Create the channel folder**
   - `convex/ai_zone/channels/<channel>/`
   - Follow the folder contract described in `docs/handbook/convex/channels.md`.

2. **Add payload parsing (`api.ts`)**
   - Parse vendor payloads into a normalized event shape.
   - Add tests for payload parsing.

3. **Add thin webhook handler (`webhook.ts`)**
   - Validate and parse.
   - Ensure channel user exists (if applicable).
   - Run preprocess pipelines.
   - Delegate to one internal action/mutation.
   - Send reply via transport service.

4. **Add transport service (`service.ts`)**
   - Isolate vendor API calls.
   - Return structured success/error results.

5. **Add orchestration entrypoint (`actions.ts`)**
   - Resolve identity and thread context (channel user identity).
   - Call the shared assistant/orchestrator path or a deliberate deterministic path.

6. **Wire into HTTP router**
   - Add `http.route` entries in `convex/http.ts`.

7. **Add idempotency**
   - Use vendor message ids as dedupe keys.
   - Persist “processed message ids” if the channel requires it.

---

## Common pitfalls

- No dedupe → duplicate replies on webhook retries.
- Doing AI calls directly in the webhook handler.
- Logging raw request bodies.

