# Dashboard: _core Zone

## Role in the Architecture
This is the foundational layer of the Anan Dashboard. It contains the bootstrapping code, global configuration, and base infrastructure.

## Directory Breakdown

- **`app/`**: Contains `App.tsx` (the root router and provider tree).
- **`config/`**: Global constants, landing page content schemas, and model definitions.
- **`hooks/`**: Base infrastructure hooks (e.g., `useRole`, `useSession`, `useConvexBootstrapState`).
- **`lib/`**: Generic platform utilities (auth-client, convex-client, redirect-logic).
- **`router/`**: Specialized routing components (LocaleRoot, RestrictedRoute).
- **`store/`**: Global state management (Zustand or similar).

## Rules of Engagement

1. **NO Business Logic:** Business logic belongs in the specialized `zone` folders or `shared_logic`. Only infrastructure and cross-cutting concerns live here.
2. **Immutable Primitives:** Items in `_core` should be stable. Major changes here affect the entire platform.
3. **Pure Infrastructure:** Hooks in `_core/hooks` should only manage platform state (Auth, Role, Theme, Language). They should NEVER fetch business data (Properties, Deals, Users). Data-fetching hooks belong in `<zone>/api/`.
4. **Registration:** New zones MUST be registered in `App.tsx` and wrapped in their respective `ErrorBoundary`.
