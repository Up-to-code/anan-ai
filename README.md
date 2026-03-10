# anan-lit

Anan is a real estate platform powered by a configurable multi-agent backend and a high-performance Next.js frontend.

## Core Architecture

- **Backend**: Convex Auth (Google OAuth) for authentication.
- **Security**: Server-side authorization in `convex/_core/security/accessPolicy.ts`.
- **AI Agents**: Configurable multi-agent system in `convex/ai_zone/agents/core/`.

## Setup

```bash
cd anan-lit
bun install
bunx convex dev   # Starts deployment and dev server
```

## Structure

- `web/app/` – Next.js App Router entrypoints for `/`, `/signin`, `/ws`, etc.
- `web/app/(wso)/ws/` – The focused **Anan Workspace** shell and layout.
- `web/components/shared/ag-aui/` – Institutional UI components (AgPropertyCard, AgBrokerCard, etc.).
- `convex/_core/security/` – Centralized access policies and identity normalization.
- `convex/ai_zone/agents/core/` – Shared agent runtime, prompts, and tools.

## The Anan Workspace

The workspace is designed for high-stakes real estate operations with a focus on AI-driven efficiency:

- **Focused AI Interface**: A clean, distraction-free dashboard centered on the Anan logo and chat input.
- **Dark Sidebar Navigation**: A professional, high-contrast dark sidebar (`slate-950`) for seamless navigation across Zones.
- **Institutional Design**: Minimalist aesthetics using precision borders (2px) and curated brand colors.

## Documentation

- **Backend Architecture**: See `convex/SYSTEM_STRUCTURE_ARCHITECTURE.md`.
- **Design System**: See `web/system_ui_design.json`.
- **Planning**: See `.cursor/rules/anan-lit-agent.mdc`.
