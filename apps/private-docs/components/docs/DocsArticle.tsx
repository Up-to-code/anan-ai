import Image from "next/image";
import Link from "next/link";
import { docsPages, getDocsPageSiblings, getDocsSectionId } from "@/lib/docs/registry";
import type { DocsPageDefinition } from "@/lib/docs/types";
import Callout from "./Callout";
import CodeSnippet from "./CodeSnippet";
import FindingCard from "./FindingCard";

function DocsPagination({ page }: { page: DocsPageDefinition }) {
  const { previousPageKey, nextPageKey } = getDocsPageSiblings(page.key);
  const previousPage = previousPageKey ? docsPages[previousPageKey] : null;
  const nextPage = nextPageKey ? docsPages[nextPageKey] : null;

  if (!previousPage && !nextPage) return null;

  return (
    <div className="mt-12 grid gap-px border-t-2 border-slate-100 bg-slate-100 pt-8 sm:grid-cols-2">
      {previousPage ? (
        <Link
          href={previousPage.href}
          className="group flex flex-col items-start justify-center bg-white p-8 transition-colors hover:bg-slate-50"
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previous</div>
          <div className="mt-2 text-sm font-black tracking-widest text-slate-900 transition-colors group-hover:text-teal-700">
            {previousPage.title}
          </div>
        </Link>
      ) : (
        <div className="bg-white" />
      )}
      {nextPage ? (
        <Link
          href={nextPage.href}
          className="group flex flex-col items-end justify-center bg-white p-8 text-right transition-colors hover:bg-slate-50"
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next</div>
          <div className="mt-2 text-sm font-black tracking-widest text-slate-900 transition-colors group-hover:text-teal-700">
            {nextPage.title}
          </div>
        </Link>
      ) : null}
    </div>
  );
}

export default function DocsArticle({ page }: { page: DocsPageDefinition }) {
  return (
    <article className="mx-auto w-full max-w-[860px] space-y-12 pb-16">
      <header className="space-y-6">
        <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">
          {page.description}
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">{page.title}</h1>
        <p className="max-w-2xl text-lg font-bold leading-relaxed text-slate-500">{page.summary}</p>
        {page.intro?.length ? (
          <div className="max-w-3xl space-y-4 pt-2">
            {page.intro.map((paragraph) => (
              <p key={paragraph} className="text-base font-medium leading-loose text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </header>

      <div className="space-y-12">
        {page.sections.map((section, index) => (
          <section
            key={section.id}
            id={getDocsSectionId(page.key, section.id)}
            className={`scroll-mt-24 space-y-6 ${index > 0 ? "border-t-2 border-slate-100 pt-10" : "pt-4"}`}
          >
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{section.title}</h2>
              {section.summary ? (
                <p className="text-base font-medium leading-relaxed text-slate-500">{section.summary}</p>
              ) : null}
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

            {section.findings ? (
              <div className="space-y-4">
                {section.findings.map((finding) => (
                  <FindingCard key={finding.title} finding={finding} />
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

            {section.callouts ? (
              <div className="space-y-4 pt-2">
                {section.callouts.map((callout) => (
                  <Callout key={`${callout.tone}-${callout.title}`} callout={callout} />
                ))}
              </div>
            ) : null}

            {section.table ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        {section.table.headers.map((header) => (
                          <th
                            key={header}
                            className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-500"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")} className="align-top">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={`${row.join("|")}-${cellIndex}`}
                              className="border-b border-slate-100 px-4 py-4 text-sm font-medium leading-7 text-slate-700 last:border-b-0"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {section.visuals ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {section.visuals.map((visual) => (
                  <figure
                    key={`${visual.src}-${visual.title}`}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 p-4">
                      <div className="text-sm font-black tracking-tight text-slate-950">{visual.title}</div>
                    </div>
                    <div className="p-4">
                      <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                        <Image
                          src={visual.src}
                          alt={visual.alt}
                          width={1600}
                          height={900}
                          className="h-auto w-full"
                        />
                      </div>
                      <figcaption className="mt-4 text-sm font-medium leading-7 text-slate-600">
                        {visual.caption}
                      </figcaption>
                    </div>
                  </figure>
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

            {section.links ? (
              <div className="grid gap-4 md:grid-cols-2">
                {section.links.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
                  >
                    <div className="text-sm font-black tracking-tight text-slate-950 group-hover:text-teal-700">
                      {link.label}
                    </div>
                    <div className="mt-2 text-sm font-medium leading-7 text-slate-600">
                      {link.description}
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {page.deepSources?.length ? (
        <section className="space-y-5 border-t-2 border-slate-100 pt-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Deep Source References</h2>
            <p className="text-base font-medium leading-relaxed text-slate-500">
              These repo files are the deeper source material behind this in-app handbook page.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {page.deepSources.map((source) => (
              <article
                key={`${source.path}-${source.description}`}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Repo Source</div>
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <code className="text-xs font-semibold text-slate-800">{source.path}</code>
                </div>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{source.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {page.related?.length ? (
        <section className="space-y-5 border-t-2 border-slate-100 pt-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Related Pages</h2>
            <p className="text-base font-medium leading-relaxed text-slate-500">
              Keep moving through the handbook using the most relevant adjacent topics.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {page.related.map((relatedPageKey) => {
              const relatedPage = docsPages[relatedPageKey];

              return (
                <Link
                  key={relatedPage.key}
                  href={relatedPage.href}
                  className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {relatedPage.description}
                  </div>
                  <div className="mt-2 text-base font-black tracking-tight text-slate-950 group-hover:text-teal-700">
                    {relatedPage.title}
                  </div>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                    {relatedPage.summary}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <DocsPagination page={page} />
    </article>
  );
}
