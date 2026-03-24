import type { DocsPageDefinition } from "./registry";
import { docsPageMeta, docsPageOrder, getDocsSectionId } from "./registry";

type DocsSidebarProps = {
  page: DocsPageDefinition;
};

function SidebarSectionHeading({ label }: { label: string }) {
  return <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</div>;
}

function PageTocSection({ page }: DocsSidebarProps) {
  return (
    <section className="border border-slate-200/70 bg-white p-5 shadow-sm">
      <SidebarSectionHeading label="On this page" />
      <div className="mt-4 space-y-3">
        {page.sections.map((section) => (
          <a
            key={section.title}
            href={`#${getDocsSectionId(section.title)}`}
            className="block text-sm font-semibold leading-6 text-slate-700 hover:text-slate-950"
          >
            {section.title}
          </a>
        ))}
      </div>
    </section>
  );
}

function HandbookSequenceSection({ page }: DocsSidebarProps) {
  return (
    <section className="border border-slate-200/70 bg-slate-50/80 p-5 shadow-sm">
      <SidebarSectionHeading label="Handbook sequence" />
      <div className="mt-4 space-y-3">
        {docsPageOrder.map((pageKey) => {
          const pageMeta = docsPageMeta[pageKey];
          const active = pageKey === page.key;
          const className = [
            "block text-sm font-semibold leading-6",
            active ? "text-slate-950" : "text-slate-600 hover:text-slate-950",
          ].join(" ");
          return (
            <a key={pageMeta.href} href={pageMeta.href} className={className}>
              {pageMeta.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}

/**
 * WHY:   The docs experience needs stable local navigation so developers can skim long pages without losing context.
 * WHAT:  Renders the page table of contents plus the full handbook sequence in a single sidebar.
 * HOW:   Derives anchors from section titles and page routes from the shared docs registry.
 */
export default function DocsSidebar({ page }: DocsSidebarProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <PageTocSection page={page} />
        <HandbookSequenceSection page={page} />
      </div>
    </aside>
  );
}
