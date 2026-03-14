# Docs Page

- Renders the internal developer handbook as real admin routes.
- `index.tsx` is the thin orchestrator entrypoint.
- `registry.tsx` holds the typed docs registry and imports page definitions from `pages/*`.
- `types.ts` defines the docs types and `DocsPageKey` union.
- `DocsLayoutShell.tsx` owns the shared handbook shell and route navigation.
- `DocsArticle.tsx` renders one full handbook page.
- `DocsSidebar.tsx` renders the local table of contents and full handbook sequence.
- `DocsSectionPanel.tsx` renders structured docs sections, tables, code blocks, and link lists.

Keep docs content declarative and route-driven. Do not add a Markdown renderer here unless the platform deliberately chooses that direction later.
