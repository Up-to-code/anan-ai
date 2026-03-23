/**
 * WHY:   The client assistant needs one consistent branded mark for header, welcome state, and assistant identity.
 * WHAT:  Renders a compact inline SVG brand mark with a small motion-state treatment.
 * HOW:   Uses local CSS classes only so the icon remains portable across the client-web surface.
 */
export function AnanBrandMark({
  className = "",
  state = "idle",
}: {
  className?: string;
  state?: "idle" | "thinking" | "success";
}) {
  const glowClass =
    state === "thinking"
      ? "animate-pulse bg-blue-500/18"
      : state === "success"
        ? "bg-emerald-500/14"
        : "bg-blue-500/12";

  return (
    <span className={`relative inline-flex h-9 w-9 items-center justify-center ${className}`}>
      <span className={`absolute inset-0 rounded-full blur-md ${glowClass}`} />
      <svg viewBox="0 0 96 96" className="relative h-9 w-9" aria-hidden="true">
        <circle cx="48" cy="48" r="34" stroke="#D7E3F4" strokeWidth="2.5" fill="white" />
        <path d="M48 22V35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M74 48H61" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M48 74V61" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M22 48H35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="48" cy="22" r="4.25" fill="#0F172A" />
        <circle cx="74" cy="48" r="4.25" fill="#0F172A" />
        <circle cx="48" cy="74" r="4.25" fill="#0F172A" />
        <circle cx="22" cy="48" r="4.25" fill="#0F172A" />
        <rect x="37" y="37" width="22" height="22" rx="4.5" fill="#0F172A" />
        <path d="M42.5 56L48 42.5L53.5 56" stroke="white" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45.5 50.3H50.5" stroke="white" strokeWidth="3.25" strokeLinecap="round" />
      </svg>
    </span>
  );
}
