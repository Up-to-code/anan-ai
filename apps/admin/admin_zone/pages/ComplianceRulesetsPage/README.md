# Compliance Rulesets Page

## Purpose

Central admin surface for creating and maintaining compliance rulesets that drive onboarding checklists, publish gates, and workspace banners.

## Structure

- `index.tsx`
  - Server-rendered page that loads rulesets, renders the edit form, and lists existing rulesets.

## Notes

- Rulesets are stored in Convex (`complianceRulesets`) and edited via `admin_zone/api/compliance`.
- Seeded defaults are inserted once for KSA when the page first loads.
