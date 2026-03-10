# Anan: Multi-Channel Real Estate Infrastructure

Anan is a centralized real estate platform designed to unify data, distribution, and sales execution between Users, Developers, and Brokers.

## 1. Core Ecosystem

| Party | Role | Ecosystem Interaction |
|-------|------|----------------------|
| **Users** | Buyers & Investors | Interact via AI Agent (WhatsApp/Web) to receive tailored matching & closing support. |
| **Developers (RED)** | Project Owners | Upload projects, manage broker visibility, and track live market demand analytics. |
| **Brokers** | Distribution Partners | Access projects, collaborate with peers, and manage lead pipelines in a unified CRM. |

---

## 2. Technical Architecture

### Multi-Channel Distribution
Anan operates as a layered distribution system:
1. **AI Agent Layer**: Primary user interface (WhatsApp + Next.js Workspace).
2. **Broker Collaboration Layer**: Private marketplace for peer-to-peer deal closing.
3. **Developer Direct Layer**: Instant project activation and automated sales team routing.

### Directory Structure
- `web/` – High-performance Next.js App Router frontend.
  - `app/(wso)/ws/` – Focused **Anan Workspace** (AI-First dashboard).
  - `components/shared/ag-aui/` – Institutional design system (Sharp Blue Minimalism).
- `convex/` – Multi-agent backend and real-time data layer.
  - `_core/security/` – Centralized access policies and identity normalization.
  - `ai_zone/agents/core/` – Configurable agent runtime and modular toolsets.

---

## 3. Operational Philosophy

- **No Complexity**: Simple onboarding (Login → Add project → Activate).
- **No Forced Contracts**: A flexible ecosystem that adapts to partner needs.
- **Institutional Aesthetics**: 0px radius (mostly), 2px precision borders, and high-contrast dark sidebars.
- **AI-First UX**: A distraction-free workspace centering on the Anan logo and chat-driven workflows.

---

## 4. "Anan Architecture" Coding Rules

All contributors (human and AI) must adhere to these rigorous standards:

1. **The Orchestrator Pattern**: No monolithic files. Use `Folder/index.tsx` as a thin orchestrator delegating to focused sub-components.
2. **JSDoc WHY/WHAT/HOW**: Every exported item MUST include:
   - `WHY`: Business purpose.
   - `WHAT`: Technical transform (Inputs/Outputs).
   - `HOW`: Implementation mechanisms or state rules.
3. **Strict Zone Isolation**: Never import directly between zones (e.g., `web/app/(wso)/ws/`). Use public hooks or shared logic.
4. **README Manifests**: Every major functional directory must contain a `README.md` defining its internal structure.

---

## 5. Development

```bash
cd anan-lit
bun install
bunx convex dev # Starts backend and generates types
cd web && bun dev # Starts Next.js development server
```

For detailed protocol audits, see `docs/backend-audit-2026-03-08.md`.
tory design, and tool ownership model.

## Plan

See `anan-lit_complete_plan_435416d4.plan.md` and `.cursor/rules/anan-lit-agent.mdc`.
