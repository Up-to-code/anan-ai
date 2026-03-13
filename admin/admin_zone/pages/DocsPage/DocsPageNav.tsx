import type { DocsPageKey } from "./registry";
import { docsPageMeta } from "./registry";

type DocsPageNavProps = {
  previousPageKey?: DocsPageKey;
  nextPageKey?: DocsPageKey;
};

/**
 * WHY:   A handbook experience should let developers move linearly through pages without returning to the tab bar each time.
 * WHAT:  Renders previous and next page navigation cards for the docs section.
 * HOW:   Resolves page labels and descriptions from the shared docs metadata registry.
 */
export default function DocsPageNav({ previousPageKey, nextPageKey }: DocsPageNavProps) {
  if (!previousPageKey && !nextPageKey) {
    return null;
  }

  return (
    <section className="grid gap-4 border-t border-slate-200/70 pt-8 md:grid-cols-2">
      {previousPageKey ? (
        <a
          href={docsPageMeta[previousPageKey].href}
          className="block border border-slate-200 bg-slate-50/80 p-5 transition-colors hover:border-slate-300 hover:bg-white"
        >
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Previous</div>
          <div className="mt-3 text-lg font-black tracking-tight text-slate-950">{docsPageMeta[previousPageKey].label}</div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{docsPageMeta[previousPageKey].description}</p>
        </a>
      ) : (
        <div />
      )}

      {nextPageKey ? (
        <a
          href={docsPageMeta[nextPageKey].href}
          className="block border border-slate-200 bg-slate-50/80 p-5 text-right transition-colors hover:border-slate-300 hover:bg-white"
        >
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Next</div>
          <div className="mt-3 text-lg font-black tracking-tight text-slate-950">{docsPageMeta[nextPageKey].label}</div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{docsPageMeta[nextPageKey].description}</p>
        </a>
      ) : null}
    </section>
  );
}
