import ZoneShell from "./ZoneShell";

/**
 * WHY:   Existing zone layouts already import `WorkspaceZoneShell` and should not all be rewritten at once.
 * WHAT:  Preserves the previous public component name while delegating to the new full-screen zone shell.
 * HOW:   Re-exports the `ZoneShell` implementation as a compatibility alias.
 */
export default ZoneShell;
