# Backend: RED (Real Estate Developer) Zone

## Architecture: The Fortress Pattern (Server-Side)

This zone owns all functions dedicated to Developers managing property portfolios.

### 1. Handler Isolation
Focused strictly on the `properties` and `projects` tables. Authorization must verify the user's `RED` role identity.

### 2. Service Pattern
Abstract project-level calculations or timeline logic into `services/`.

### 3. Documentation (WHY/WHAT/HOW)
Mandatory for every exported handler.
