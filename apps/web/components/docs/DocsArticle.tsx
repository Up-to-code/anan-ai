import Link from "next/link";
import { docsPages, getDocsPageSiblings, getDocsSectionId } from "@/lib/docs/registry";
import type { DocsPageDefinition } from "@/lib/docs/types";
import { Separator } from "@/components/docs-ui/separator";
import Callout from "./Callout";
import CodeSnippet from "./CodeSnippet";
import EndpointCard from "./EndpointCard";
import ScopeBadge from "./ScopeBadge";

function DocsPagination({ page }: { page: DocsPageDefinition }) {
  const { previousPageKey, nextPageKey } = getDocsPageSiblings(page.key);
  const previousPage = previousPageKey ? docsPages[previousPageKey] : null;
  const nextPage = nextPageKey ? docsPages[nextPageKey] : null;

  if (!previousPage && !nextPage) return null;

  return (
    <div className="grid gap-px border-t-2 border-slate-100 bg-slate-100 pt-8 sm:grid-cols-2 mt-12">
      {previousPage ? (
        <Link href={previousPage.href} className="group flex flex-col items-start justify-center bg-white p-8 transition-colors hover:bg-slate-50 border-r-2 border-transparent hover:border-blue-600 sm:border-slate-100 sm:hover:border-blue-600">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previous</div>
          <div className="mt-2 text-sm font-black uppercase tracking-widest text-slate-900 transition-colors group-hover:text-blue-600">{previousPage.title}</div>
        </Link>
      ) : (
        <div className="bg-white" />
      )}
      {nextPage ? (
        <Link href={nextPage.href} className="group flex flex-col items-end justify-center bg-white p-8 text-right transition-colors hover:bg-slate-50 border-l-2 border-transparent hover:border-blue-600 sm:border-slate-100 sm:hover:border-blue-600">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next</div>
          <div className="mt-2 text-sm font-black uppercase tracking-widest text-slate-900 transition-colors group-hover:text-blue-600">{nextPage.title}</div>
        </Link>
      ) : null}
    </div>
  );
}

export default function DocsArticle({ page }: { page: DocsPageDefinition }) {
  return (
    <article className="mx-auto w-full max-w-[800px] space-y-12 pb-16">
      <header className="space-y-6">
        <div className="inline-flex items-center rounded-none border-2 border-blue-600 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
          {page.description}
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-950 lg:text-5xl">{page.title}</h1>
        <p className="max-w-2xl text-lg font-bold leading-relaxed text-slate-500">{page.summary}</p>
      </header>

      <div className="space-y-12">
        {page.sections.map((section, index) => (
          <section key={section.id} id={getDocsSectionId(page.key, section.id)} className={`space-y-6 ${index > 0 ? "border-t-2 border-slate-100 pt-10" : "pt-4"}`}>
            <div className="space-y-3">
              <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">{section.title}</h2>
              {section.summary ? <p className="text-base font-medium leading-relaxed text-slate-500">{section.summary}</p> : null}
            </div>

            {section.paragraphs ? (
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base font-medium leading-loose text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {section.bullets ? (
              <ul className="list-disc space-y-3 pl-6 text-base font-medium leading-relaxed text-slate-700 marker:text-slate-300">
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
