export default function ZoneLoading() {
  return (
    <div className="animate-pulse space-y-8 p-6 lg:p-10">
      <div className="space-y-4">
        <div className="h-8 w-1/4 rounded-md bg-slate-200/60" />
        <div className="h-4 w-2/5 rounded-md bg-slate-100" />
      </div>
      <div className="space-y-4">
        <div className="h-32 w-full rounded-lg bg-slate-100/50" />
        <div className="h-32 w-full rounded-lg bg-slate-100/50" />
        <div className="h-32 w-full rounded-lg bg-slate-100/50" />
      </div>
    </div>
  );
}
