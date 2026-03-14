import DocsSectionPanel from "./DocsSectionPanel";
import DocsSidebar from "./DocsSidebar";
import DocsPageNav from "./DocsPageNav";
import type { DocsPageDefinition } from "./registry";
import { docsPageMeta, getDocsPageSiblings, getDocsSectionId } from "./registry";

type DocsArticleProps = {
  page: DocsPageDefinition;
};

/**
 * WHY:   The handbook needs one consistent article renderer so every docs route feels like part of the same in-app documentation system.
 * WHAT:  Renders a docs article header, intro copy, structured sections, and related-page navigation.
 * HOW:   Composes the docs section panels and related-link cards using existing admin shared primitives.
 */
export default function DocsArticle({ page }: DocsArticleProps) {
  const { previousPageKey, nextPageKey } = getDocsPageSiblings(page.key);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <article className="min-w-0 border border-slate-200/70 bg-white shadow-sm">
        <header className="space-y-6 border-b border-slate-200/70 px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-slate-700">
              {page.eyebrow ?? "Internal handbook"}
            </div>
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
              {page.sections.length} sections
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-5xl text-4xl font-black tracking-tight text-slate-950">{page.title}</h1>
            <p className="max-w-4xl text-base font-semibold leading-8 text-slate-600">{page.summary}</p>
          </div>

          <div className="space-y-4">
            {page.intro.map((paragraph) => (
              <p key={paragraph} className="max-w-4xl text-sm font-semibold leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">What you will find here</div>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
                This page is part of the route-backed internal handbook. Use the local section links to skim, then move
                through the sequence with the previous and next cards at the bottom.
              </p>
            </div>
            <div className="border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Related routes</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {page.related.map((relatedKey) => (
                  <a
                    key={relatedKey}
                    href={docsPageMeta[relatedKey].href}
                    className="border border-slate-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                  >
                    {docsPageMeta[relatedKey].label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-12 px-6 py-8 lg:px-10 lg:py-10">
          {page.sections.map((section) => (
            <DocsSectionPanel key={section.title} section={section} sectionId={getDocsSectionId(section.title)} />
          ))}

          <section className="space-y-4 border-t border-slate-200/70 pt-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-black tracking-tight text-slate-950">Related pages</div>
              <a href="/docs" className="text-sm font-black tracking-tight text-slate-600 hover:text-slate-950">
                Back to overview
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {page.related.map((relatedKey) => {
                const related = docsPageMeta[relatedKey];
                return (
                  <a
                    key={related.href}
                    href={related.href}
                    className="block border border-slate-200 bg-slate-50/70 p-5 transition-colors hover:border-slate-300 hover:bg-white"
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-black tracking-tight text-slate-950">{related.label}</div>
                      <p className="text-sm font-semibold leading-6 text-slate-600">{related.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          <DocsPageNav previousPageKey={previousPageKey} nextPageKey={nextPageKey} />
        </div>
      </article>

      <DocsSidebar page={page} />
    </div>
  );
}
