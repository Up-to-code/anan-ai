# Anan Coding Standards & Best Practices

This guide ensures that all contributors (Human or AI) maintain the high-quality, durable, and scalable architecture of the Anan platform.

## 1. The Golden Rule: WHY, WHAT, HOW
Every exported function or component **MUST** have a JSDoc block.

- **WHY**: The purpose. "Why does this exist?"
- **WHAT**: The outcome. "What does it return or render?"
- **HOW**: The implementation. "How does it work under the hood?"

---

## 2. Frontend Standards (Fortress Concept)

### A. Folder-First Orchestration
Never create a standalone `.tsx` file for a page. 
- **BAD**: `broker_zone/pages/CRM.tsx`
- **GOOD**: `broker_zone/pages/CRM/index.tsx`

### B. "Dumb" UI vs "Smart" Orchestrators
- **Orchestrators (`index.tsx`)**: Fetch data from `api/` hooks. Handle routing params. Handle main state.
- **Components (`components/*.tsx`)**: Receive data through props. They should be "pure" UI whenever possible.
- **Shared (`shared_logic/components/*.tsx`)**: Truly generic components (buttons, inputs, cards) that are used across zones.

### C. Import Discipline
- **NEVER** deep-import cross-zone. 
- Use `@/` aliases consistently.
- Only export public members from a zone's `index.ts`.

---

## 3. Backend Standards (Multi-Agent & Fortress)

### A. Authorization First
Every query and mutation must start by identifying the user and checking their role.
```typescript
const user = await ctx.auth.getUserIdentity();
if (!user) throw new Error("Unauthorized");
```

### B. AI Orchestration
- Never invoke an LLM directly.
- Use `anan.orchestrate(prompt)` to leverage the multi-agent system.
- Ensure specialized team agents exist for specific domain questions.

### C. Errors & Resiliency
- Wrap external network calls in `shared_logic/lib/retry.ts` equivalent or the agent's `errorHandler.ts`.
- Classify errors (UserError vs SystemError) to provide beautiful feedback in the dashboard.

---

## 4. UI/UX "Wows"
- **Transitions**: Every page change and data loading state must use subtle animations (Tailwind `animate-in`, Framer Motion, or simple CSS transitions).
- **Glassmorphism**: Use `backdrop-blur` and translucent borders (`border-white/10`) for a premium layout feel.
- **RTL Support**: Since the platform is primarily Arabic, always ensure `text-right` and proper flex direction. Use `useLocale` to localize strings via the `dictionary.ts`.

---

## 5. Security
- Sensitive data is never stored in `localStorage`.
- PIN codes for invitations must have a strict 24-hour expiration (`invitation_pins`).
- Use Better Auth for all secure session management.
