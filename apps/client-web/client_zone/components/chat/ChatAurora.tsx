/**
 * WHY:   The simplified chat UI still needs a refined visual atmosphere without turning the surfaces translucent.
 * WHAT:  Renders a fixed aurora-style background layer behind the entire app shell.
 * HOW:   Uses blurred gradient blobs with alpha in the color values so only the background glows, not the UI above it.
 */
export function ChatAurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),rgba(248,250,252,0.98)_42%,rgba(248,250,252,1)_100%)]" />
      <div className="absolute -top-32 left-[-8rem] h-80 w-80 rounded-full bg-[rgba(37,99,235,0.16)] blur-3xl" />
      <div className="absolute top-[18%] right-[-6rem] h-96 w-96 rounded-full bg-[rgba(59,130,246,0.12)] blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-[rgba(148,163,184,0.16)] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0))]" />
    </div>
  );
}
