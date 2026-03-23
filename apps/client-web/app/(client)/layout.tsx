/**
 * WHY:   Client app routes share the same global providers and only need a thin route-group wrapper.
 * WHAT:  Renders the chat-first client application pages.
 * HOW:   Keeps the route group lightweight while page folders own their orchestration.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return children;
}
