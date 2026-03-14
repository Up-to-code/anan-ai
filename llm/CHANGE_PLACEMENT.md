# Where code goes (Decision Tree)

---

## 1) Which surface owns the change?

- Web UI/workspace behavior → `apps/web`
- Admin console behavior → `apps/admin`
- Mobile behavior → `apps/mobile`
- Persistence/shared rules/AI/channels → `convex`

---

## 2) If it’s backend logic, which Convex zone?

- Schema/security/auth → `convex/_core`
- Shared business capability → `convex/shared_logic/<capability>`
- Assistant runtime or channel → `convex/ai_zone`
- Buyer/mobile backend → `convex/user_zone`
- Broker-only adapter → `convex/broker_zone`
- Developer-only adapter → `convex/red_zone`
- Admin projection/ops → `convex/admin_zone`
- Public entry feature → `convex/public_zone`

---

## 3) If it’s web-only orchestration (not shared backend logic)

Use the web gateway:

- `apps/web/server/contracts/**` (DTOs + validation)
- `apps/web/server/domains/**` (orchestration)
- `apps/web/server/infrastructure/convex/**` (Convex repo adapters)
- `apps/web/app/api/**` (thin handlers)

Deep reference: `docs/handbook/web/server-gateway.md`

