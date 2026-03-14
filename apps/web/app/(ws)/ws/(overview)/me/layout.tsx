/**
 * WHY:   Profile routes do not need extra chrome beyond the overview workspace shell.
 * WHAT:  Keeps the `/ws/me` subtree transparent inside the overview layout.
 * HOW:   Returns children unchanged so account pages can supply their own content structure.
 */
export default function WorkspaceMeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
