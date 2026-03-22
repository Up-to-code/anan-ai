/**
 * WHY:   `/ws` hosts multiple sibling route groups with different shell behavior.
 * WHAT:  Provides a neutral route boundary under the workspace runtime.
 * HOW:   Leaves auth and Convex context ownership to the parent `(ws)` group layout.
 */
export default function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
