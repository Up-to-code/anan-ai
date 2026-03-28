import Link from "next/link";
import { docsPages, getDocsPageSiblings, getDocsSectionId } from "@/lib/docs/registry";
import type { DocsPageDefinition } from "@/lib/docs/types";
import Callout from "./Callout";
import CodeExampleGroup from "./CodeExampleGroup";
import CodeSnippet from "./CodeSnippet";
import EndpointCard from "./EndpointCard";
import ScopeBadge from "./ScopeBadge";

function DocsPagination({ page }: { page: DocsPageDefinition }) {
  const { previousPageKey, nextPageKey } = getDocsPageSiblings(page.key);
  const previousPage = previousPageKey ? docsPages[previousPageKey] : null;
  const nextPage = nextPageKey ? docsPages[nextPageKey] : null;

  if (!previousPage && !nextPage) return null;

  return (
    <div className="grid gap-4 pt-8 sm:grid-cols-2 mt-12 border-t border-black/5 dark:border-white/5">
      {previousPage ? (
        <Link href={previousPage.href} className="group flex flex-col items-start justify-center rounded-3xl border border-black/5 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:border-white/5 dark:bg-[#111114] dark:shadow-none dark:hover:border-blue-500/40 dark:hover:bg-[#18181b]">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Previous</div>
          <div className="mt-2 text-sm font-black uppercase tracking-widest text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">{previousPage.title}</div>
        </Link>
      ) : (
        <div />
      )}
      {nextPage ? (
        <Link href={nextPage.href} className="group flex flex-col items-end justify-center rounded-3xl border border-black/5 bg-white p-8 text-right shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:border-white/5 dark:bg-[#111114] dark:shadow-none dark:hover:border-blue-500/40 dark:hover:bg-[#18181b]">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Next</div>
          <div className="mt-2 text-sm font-black uppercase tracking-widest text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">{nextPage.title}</div>
        </Link>
      ) : null}
    </div>
  );
}

export default function DocsArticle({ page }: { page: DocsPageDefinition }) {
  return (
    <article className="mx-auto w-full max-w-[800px] space-y-12 pb-16">
      <header className="space-y-6">
        <div className="inline-flex items-center rounded-full border border-blue-600/20 bg-blue-50/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm backdrop-blur-sm dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
          {page.description}
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-950 lg:text-5xl dark:text-white">{page.title}</h1>
        <p className="max-w-2xl text-lg font-bold leading-relaxed text-slate-500 dark:text-slate-400">{page.summary}</p>
      </header>

      <div className="space-y-12">
        {page.sections.map((section, index) => (
          <section key={section.id} id={getDocsSectionId(page.key, section.id)} className={`space-y-6 ${index > 0 ? "border-t border-black/5 pt-10 dark:border-white/5" : "pt-4"}`}>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">{section.title}</h2>
              {section.summary ? <p className="text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400">{section.summary}</p> : null}
            </div>

            {section.paragraphs ? (
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base font-medium leading-loose text-slate-700 dark:text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {section.bullets ? (
              <ul className="list-disc space-y-3 pl-6 text-base font-medium leading-relaxed text-slate-700 marker:text-slate-300 dark:text-slate-300 dark:marker:text-slate-600">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}

            {section.scopes ? (
              <div className="grid gap-3 md:grid-cols-2">
                {section.scopes.map((scope) => (
                  <ScopeBadge key={scope.id} scopeId={scope.id} />
                ))}
              </div>
            ) : null}

            {section.callouts ? (
              <div className="space-y-4 pt-2">
                {section.callouts.map((callout) => (
                  <Callout key={`${callout.tone}-${callout.title}`} callout={callout} />
                ))}
              </div>
            ) : null}

            {section.relatedLinks && section.relatedLinks.length > 0 ? (
              <div className="grid gap-4 pt-2 md:grid-cols-2">
                {section.relatedLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:border-white/5 dark:bg-[#111114] dark:shadow-none dark:hover:border-blue-500/40 dark:hover:bg-[#18181b]"
                  >
                    <div className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">{link.label}</div>
                    {link.description ? <div className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{link.description}</div> : null}
                  </Link>
                ))}
              </div>
            ) : null}

            {section.images && section.images.length > 0 ? (
              <div className="space-y-8 pt-4">
                {section.images.map((img) => (
                  <figure key={img.src} className="flex flex-col items-center overflow-hidden rounded-3xl border border-black/5 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-[#111114]">
                    <img src={img.src} alt={img.alt} className={`w-full h-auto object-cover ${img.className || ""}`} />
                    {img.caption && (
                      <figcaption className="w-full border-t border-black/5 p-4 text-center text-xs font-semibold text-slate-500 dark:border-white/5 dark:text-slate-400">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ) : null}

            {section.videos && section.videos.length > 0 ? (
              <div className="space-y-8 pt-4">
                {section.videos.map((vid) => (
                  <div key={vid.src} className="overflow-hidden rounded-3xl border border-black/5 shadow-sm dark:border-white/10">
                    <video src={vid.src} controls className={`w-full h-auto object-cover ${vid.className || ""}`} />
                    {vid.title && (
                      <div className="w-full border-t border-black/5 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500 dark:border-white/5 dark:bg-[#111114] dark:text-slate-400">
                        {vid.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {section.codeExampleGroups ? (
              <div className="space-y-6 pt-2">
                {section.codeExampleGroups.map((group) => (
                  <CodeExampleGroup key={group.title} group={group} />
                ))}
              </div>
            ) : null}

            {section.codeExamples ? (
              <div className="space-y-6 pt-2">
                {section.codeExamples.map((example) => (
                  <CodeSnippet key={`${example.language}-${example.title}`} example={example} />
                ))}
              </div>
            ) : null}

            {section.endpoints ? (
              <div className="space-y-6 pt-2">
                {section.endpoints.map((endpoint) => (
                  <EndpointCard key={`${endpoint.method}-${endpoint.path}-${endpoint.title}`} endpoint={endpoint} />
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <DocsPagination page={page} />
    </article>
  );
}
