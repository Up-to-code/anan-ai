/**
 * WHY:   `/ws` now hosts multiple sibling route groups with different shell behavior.
 * WHAT:  Provides a neutral route boundary so overview pages and business zones can each own their layout.
 * HOW:   Leaves authentication and chrome decisions to the nested route-group layouts.
 */
export default function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
