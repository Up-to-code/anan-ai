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
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <article className="min-w-0 rounded-3xl border border-border/30 bg-card/50 shadow-sm overflow-hidden animate-zone-page-enter">
        <header className="space-y-12 border-b border-border/10 px-8 py-12 lg:px-16 lg:py-16 bg-muted/5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-3 border border-border/40 bg-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground shadow-sm rounded-xl">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {page.eyebrow ?? "Manual & Guidelines"}
            </div>
            <div className="inline-flex items-center gap-2 border border-border/40 bg-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 shadow-sm rounded-xl">
              {page.sections.length} Chapters
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="max-w-5xl text-6xl font-black tracking-tighter text-foreground leading-[1.1] decoration-primary/20 underline decoration-8 underline-offset-[12px] decoration-skip-ink-none">{page.title}</h1>
            <p className="max-w-4xl text-xl font-bold leading-relaxed text-muted-foreground/50">{page.summary}</p>
          </div>

          <div className="space-y-5">
            {page.intro.map((paragraph) => (
              <p key={paragraph} className="max-w-4xl text-[15px] font-bold leading-relaxed text-muted-foreground/60 italic">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-2xl border border-border/20 bg-background p-8 shadow-sm space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Handbook Context</div>
              <p className="text-[14px] font-bold leading-relaxed text-muted-foreground/70">
                This documentation is part of the route-backed internal handbook. Sections are interactive and mapped to operational workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-border/20 bg-background p-8 shadow-sm space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Navigation</div>
              <div className="flex flex-wrap gap-2.5">
                {page.related.map((relatedKey) => (
                  <a
                    key={relatedKey}
                    href={docsPageMeta[relatedKey].href}
                    className="rounded-xl border border-border/40 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground/60 transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5 hover:scale-105"
                  >
                    {docsPageMeta[relatedKey].label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-16 px-8 py-10 lg:px-12 lg:py-12">
          {page.sections.map((section) => (
            <DocsSectionPanel key={section.title} section={section} sectionId={getDocsSectionId(section.title)} />
          ))}

          <section className="space-y-6 border-t border-border/20 pt-12">
            <div className="flex items-center justify-between gap-4">
              <div className="text-2xl font-black tracking-tight text-foreground">Related pages</div>
              <a href="/docs" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors">
                Back to overview
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {page.related.map((relatedKey) => {
                const related = docsPageMeta[relatedKey];
                return (
                  <a
                    key={related.href}
                    href={related.href}
                    className="group block rounded-2xl border border-border/30 bg-muted/5 p-6 transition-all hover:bg-muted/10 hover:border-primary/30"
                  >
                    <div className="space-y-3">
                      <div className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{related.label}</div>
                      <p className="text-[13px] font-bold leading-relaxed text-muted-foreground/60">{related.description}</p>
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
