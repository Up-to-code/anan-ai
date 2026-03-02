# Frontend Fortress Architecture

The frontend of Anan is built using the "Fortress Concept", a pattern designed to completely isolate distinct business domains (zones) from each other. 

## 1. Directory Structure

A compliant zone (e.g., `broker_zone`) must look exactly like this:

```text
dashboard/src/broker_zone/
├── index.ts                     <-- The Gateway
├── ZONE_README.md               <-- Zone-specific rules
├── errors/
│   └── ErrorBoundary.tsx        <-- The Vault
├── api/
│   └── useBrokerData.ts         <-- Data Fetching
└── pages/
    └── CRM/
        ├── index.tsx            <-- The Orchestrator
        └── components/
            └── DealBoard.tsx    <-- Pure UI component
```

## 2. The API Gateway (`index.ts`)

To ensure strict modularity, zones act as isolated modules. You are strictly forbidden from writing a deep import.

**WRONG:**
`import { BrokerOverview } from "@/broker_zone/pages/Overview"`

**RIGHT:**
`import { BrokerOverview } from "@/broker_zone"`

The `index.ts` determines what is public. If a component isn't listed there, it's private to that zone.

## 3. The Orchestrator Pattern

We do not use messy, monolithic `.tsx` files. Every page is a directory. The root of that directory `index.tsx` is the Orchestrator. 
An Orchestrator has two jobs:
1. Fetch data from `api/` hooks.
2. Pass data as props to smaller, "dumb" UI components located in a `components/` subdirectory.

## 4. Mandatory Code Documentation

To prevent any AI agent (or junior developer) from making mistakes, you must document *every single exported file* using the `WHY/WHAT/HOW` standard:

```tsx
/**
 * WHY:   Presents a tailored value proposition specifically to real estate brokers.
 * WHAT:  Displays the hero section, features, pricing, and FAQ targeting broker acquisition.
 * HOW:   Designed as an Orchestrator. Parses the static `brokersConfig` and renders `LandingBlocks`.
 */
export default function BrokersLanding() { ... }
```
