# Mobile Handbook (Buyer App)

---

## WHY

The mobile app is the buyer-facing surface. It is media-heavy and UX-sensitive, and it must not hardcode backend assumptions that drift from Convex.

The shipped mobile app is backend-required, so boundaries between runtime code and legacy mock tooling must stay explicit.

---

## WHAT

Mobile lives in `apps/mobile` and uses:

- Expo Router entrypoints under `apps/mobile/app/**`,
- screen orchestration under `apps/mobile/src/features/**`,
- hooks under `apps/mobile/src/hooks/**`,
- Convex wiring under `apps/mobile/src/lib/**`.

---

## HOW (Rules)

1. Keep route files thin (Expo Router screens delegate into feature modules).
2. UI components render; hooks orchestrate; Convex endpoints own business logic.
3. Do not render raw Convex table rows: map into mobile DTOs.
4. Do not let runtime buyer flows fall back to mock data when backend wiring is missing.

---

## Where to change code

- Routes: `apps/mobile/app/**`
- Features: `apps/mobile/src/features/**`
- Hooks: `apps/mobile/src/hooks/**`
- Convex endpoints: `convex/user_zone/mobile/**`
- AI UX principles: `docs/handbook/mobile/ai-ux-principles.md`
