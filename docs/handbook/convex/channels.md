# Channels (Ingress + Handler Folder Contract)

WhatsApp is the reference implementation for channel adapters in this repo.

---

## WHY

Channels are how real users arrive before they ever sign into web/mobile. Webhooks retry, payloads vary, and vendor APIs fail.

If channel handlers are not:

- thin,
- idempotent,
- and delegated into stable zone services,

the platform becomes unreliable and impossible to debug at scale.

---

## WHAT

This chapter defines the **required folder contract** for any channel added under:

`convex/ai_zone/channels/<channel>/`

And it documents the WhatsApp pipeline:

`convex/http.ts` route → webhook handler → preprocess pipeline → `user_zone/whatsapp` action → send reply.

Current WhatsApp architecture in this repo:

- ingress stays in `convex/ai_zone/channels/whatsapp/*`
- deterministic buyer logic lives in `convex/user_zone/whatsapp/*`
- transcripts still persist into `assistantThreads` and `assistantMessages`
- webhook retries are deduped via `channelMessageReceipts`

---

## HOW (WhatsApp blueprint)

### Routing

The HTTP router in `convex/http.ts` mounts the webhook:

- `GET /api/whatsapp/webhook` — Meta verification handshake.
- `POST /api/whatsapp/webhook` — inbound messages.

### Folder contract (required files)

For a channel `<channel>`:

```text
convex/ai_zone/channels/<channel>/
  api.ts            # parse vendor payload -> normalized events
  webhook.ts        # thin httpAction handler(s)
  service.ts        # vendor transport client (sendText, markRead, etc.)
  actions.ts        # internal action entrypoints for orchestration
  preprocess/
    index.ts
    textPipeline.ts # normalize text input
    voicePipeline.ts (optional)
  rules/ (optional) # channel rules and safety policies
  *.test.ts         # payload parsing + rules tests
```

### Idempotency + dedupe

Webhooks can deliver the same message multiple times.

Rules:

1. Treat vendor `messageId` as a **dedupe key**.
2. Store and check “processed message ids” before generating replies (the storage location depends on the channel design).
3. If a message is a duplicate, return 200 “received” and do not reply again.

The current WhatsApp buyer flow stores these receipts in `channelMessageReceipts` and keeps buyer turn context in `buyerChannelStates`.

### Signature verification

Meta signs webhook POST requests.

Rules:

1. Validate `x-hub-signature-256` against the raw request body before parsing.
2. Use `WHATSAPP_APP_SECRET` for HMAC verification.
3. Reject unsigned or mismatched payloads with `401`.

### Error handling + user fallback

Channel systems must degrade safely:

- Parsing failures: respond 400 (bad request) or 200 “received” depending on vendor expectations.
- Processing failures: still return 200 “received” so the vendor doesn’t retry forever, and send a localized fallback message to the user when appropriate.

### “Thin handler” rule

`webhook.ts` must not:

- embed business logic,
- do multi-step DB writes,
- do LLM calls,
- or build long prompt context.

It may:

- parse/validate,
- verify signatures,
- claim a dedupe receipt,
- ensure the channel user record exists,
- run preprocess pipelines,
- call a single internal action/mutation for real work,
- call the transport service to send the response.

---

## Where to change code (WhatsApp reference)

- Routes: `convex/http.ts`
- Webhook handler: `convex/ai_zone/channels/whatsapp/webhook.ts`
- Payload parsing: `convex/ai_zone/channels/whatsapp/api.ts`
- Transport client: `convex/ai_zone/channels/whatsapp/service.ts`
- Preprocess: `convex/ai_zone/channels/whatsapp/preprocess/*`
- Rules: `convex/ai_zone/channels/rules/*`
- Deterministic buyer flow: `convex/user_zone/whatsapp/*`

---

## Common pitfalls

- Logging raw webhook bodies (PII risk).
- Writing handlers that are not safe under retries.
- Mixing “vendor transport” logic with orchestration logic (service boundary violation).
- Treating channels as “just another frontend” instead of an ingress system that must survive partial failures.
