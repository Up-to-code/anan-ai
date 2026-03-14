/**
 * WHY:   The market landing page should communicate clearly that the full overview is not yet available.
 * WHAT:  Renders the centered coming-soon message above the blurred market preview.
 * HOW:   Uses a simple bordered panel and backdrop blur so the preview remains visible but fully non-interactive.
 */
export default function MarketUnderDevelopmentOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/40 p-6 backdrop-blur-[2px]">
      <div className="w-full max-w-md border border-slate-300 bg-white/95 p-6 text-center shadow-[0_18px_40px_-24px_rgba(15,23,42,0.3)]">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
          Coming Soon
        </div>
        <h2 className="mt-3 text-2xl font-black text-slate-950">
          هذه الصفحة قريباً
        </h2>
        <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
          هذا القسم ما زال تحت التطوير.
        </p>
      </div>
    </div>
  );
}
