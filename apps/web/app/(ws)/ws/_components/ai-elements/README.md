# Workspace AI Elements

This folder owns the AI chat presentation and prompt-input stack used only inside the workspace.

- Keep its supporting UI primitives in the local `ui/` subtree.
- Do not import this folder from public, docs, or oauth zones.
- Cross-zone code must not depend on these workspace-only components.
