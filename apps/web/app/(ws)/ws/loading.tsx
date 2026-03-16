/**
 * WHY:   Workspace routes benefit from a lightweight loading boundary during server data fetches.
 * WHAT:  Renders a neutral skeleton that matches the workspace layout density.
 * HOW:   Uses simple blocks to avoid layout shift while data loads.
 */
export default function WorkspaceLoading() {
  return (
    <div className="min-h-svh bg-slate-50 px-6 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="h-8 w-48 animate-pulse bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse bg-white border border-slate-200" />
          <div className="h-40 animate-pulse bg-white border border-slate-200" />
        </div>
        <div className="h-64 animate-pulse bg-white border border-slate-200" />
      </div>
    </div>
  );
}
