/**
 * WHY:   Workspace direct-command routing should stay import-compatible while the implementation is split by responsibility.
 * WHAT:  Re-exports the folder-backed workspace command router entrypoint.
 * HOW:   Preserves the existing module path and delegates all parsing, formatting, and handler logic to `workspaceCommandRouter/`.
 */
export { maybeHandleWorkspaceDirectCommand } from "./workspaceCommandRouter/index";
