# File Organization Guide

Understanding where to place your files is key to maintaining the Anan Fortress architecture.

## 1. Where does my code go?

| If I am writing... | It goes here |
|-------------------|--------------|
| A new landing page | `dashboard/src/public_zone/landing/PageName/index.tsx` |
| A new broker feature | `dashboard/src/broker_zone/pages/FeatureName/index.tsx` |
| A reusable UI button | `dashboard/src/shared_logic/ui/Button.tsx` (generic) |
| A generic Form hook | `dashboard/src/shared_logic/hooks/useForm.ts` |
| An AI search agent | `convex/ai_zone/agents/team_search/anan_agent_name/` |
| A new database table | `convex/_core/schema/new_domain.ts` |
| A common backend retry | `convex/shared_logic/lib/retry.ts` |

## 2. Directory Hierarchy

### Frontend Zones
Each zone (`admin`, `broker`, `red`, `public`) consists of:
- `index.ts`: The public gateway.
- `api/`: Data-fetching hooks.
- `errors/`: The specific `ErrorBoundary`.
- `pages/`: Subfolders for each route.

### Backend Zones
Each zone consists of:
- `ZONE_README.md`: Local rules.
- `services/`: Specialized logic functions.
- `*.ts`: Convex handers (queries/mutations).

### Infrastructure
- `_core/`: Fundamental platform primitives.
- `docs/`: Architectural documentation.
- `.cursorrules`: Agent-specific instructions (The "AI Law").
