# Recipe: Add a new web domain service (gateway pattern)

---

## WHY

Web features need stable orchestration and contracts. This recipe prevents:

- Convex calls scattered in UI,
- duplicated auth checks across routes,
- inconsistent DTO shapes.

---

## WHAT

Step-by-step for adding a new web capability using:

- contracts,
- domain services,
- Convex repository adapters,
- thin route handlers.

---

## HOW (Steps)

1. **Define the contract**
   - Add zod input/output schemas under `apps/web/server/contracts/<domain>.ts`.
   - Decide naming normalization at this boundary (e.g., storage `REDId` → contract `redId`).

2. **Add the Convex repository adapter**
   - Create `apps/web/server/infrastructure/convex/<domain>Repository.ts`.
   - Only this layer calls the generated Convex API.

3. **Add the domain service**
   - Create `apps/web/server/domains/<domain>/service.ts`.
   - Responsibilities:
     - resolve session/role,
     - call repo adapter,
     - compose stable DTOs,
     - handle errors consistently.

4. **Add the route handler**
   - Create `apps/web/app/api/<path>/route.ts`.
   - Keep it thin:
     - parse request,
     - validate with the contract,
     - delegate to domain service,
     - return stable errors.

5. **Add SSR usage (optional)**
   - If the data is needed for SSR, call the domain service from server components or server actions.

---

## Common pitfalls

- Adding “just one” zod schema inside the route handler instead of contracts.
- Returning raw Convex shapes directly to the UI.
- Forgetting cache headers on user-specific API responses.

