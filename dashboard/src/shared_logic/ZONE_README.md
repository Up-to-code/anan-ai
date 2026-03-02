# Shared Logic Zone

## General Rules

This folder acts as the generic reservoir for UI widgets, forms, generic layouts, and standard hooks that are used by **multiple** different zones.

**CRITICAL RULES:**
1. If a component is only used by the `admin_zone`, it DOES NOT BELONG HERE. It belongs in `admin_zone/pages/` or `admin_zone/components/`.
2. Do not place zone-specific business rules inside `shared_logic`. Parameterize generic behaviors.
3. Keep the shared module highly pure. Rely on standard Prop drilling or generic context rather than hardcoding a Convex mutation unless that mutation is universally shared (e.g., getting basic property lists).

**DOCUMENTATION:**
As with the Fortresses, ensure complex utility methods or shared context components are properly documented with JSDoc headers (`WHY/WHAT/HOW`).
