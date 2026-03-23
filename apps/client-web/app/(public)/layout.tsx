/**
 * WHY:   Public client routes share the same global providers and only need a thin route-group wrapper.
 * WHAT:  Renders the public client pages.
 * HOW:   Delegates all chrome decisions to the page-level client-zone components.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
