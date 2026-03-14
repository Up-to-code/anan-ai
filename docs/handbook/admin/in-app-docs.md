# Admin In-App `/docs` System

---

## WHY

Anan uses a route-backed docs section inside the admin app so engineers can browse the “top-level handbook” without leaving the product.

This system intentionally does **not** use a markdown renderer to avoid bringing content parsing complexity into the admin runtime.

---

## WHAT

The docs system is implemented under:

- `apps/admin/app/(docs)/docs/*` (thin routes)
- `apps/admin/admin_zone/pages/DocsPage/*` (renderer + registry)

The canonical deep source of truth remains the markdown handbook under `docs/handbook/**`.

---

## HOW (How to add a new in-app docs page)

1. Add a new route:
   - `apps/admin/app/(docs)/docs/<slug>/page.tsx`
   - delegate to `<DocsPage pageKey="..." />`
2. Add a new page key and meta entry in the docs registry.
3. Add a typed page definition in the docs pages registry folder.
4. Keep in-app content to the “top 20%”:
   - key rules,
   - key diagrams,
   - key paths,
   - and a pointer to the deep markdown file.

Rule: do not add a markdown renderer unless the platform chooses that direction explicitly.

