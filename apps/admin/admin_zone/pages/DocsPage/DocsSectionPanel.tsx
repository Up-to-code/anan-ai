import type { DocsSection } from "./registry";

const calloutTones = {
  info: "border-sky-200 bg-sky-50 text-slate-800",
  warn: "border-amber-200 bg-amber-50 text-slate-800",
  success: "border-emerald-200 bg-emerald-50 text-slate-800",
} as const;

type DocsSectionPanelProps = {
  section: DocsSection;
  sectionId: string;
};

/**
 * WHY:   Each handbook page needs one reusable section renderer so content stays declarative instead of hard-coded in large JSX trees.
 * WHAT:  Renders a structured docs section with paragraphs, bullets, tables, code blocks, links, and optional callouts.
 * HOW:   Projects the typed section data into the existing admin panel and table primitives.
 */
export default function DocsSectionPanel({ section, sectionId }: DocsSectionPanelProps) {
  return (
    <section id={sectionId} className="scroll-mt-24 space-y-5 border-t border-slate-200/70 pt-10 first:border-t-0 first:pt-0">
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">{section.title}</h2>
      </div>

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="text-sm font-semibold leading-7 text-slate-700">
          {paragraph}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul className="space-y-3">
          {section.bullets.map((item) => (
            <li
              key={item}
              className="border-s border-slate-200 bg-slate-50/70 ps-4 pe-4 py-3 text-sm font-semibold leading-7 text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {section.callout ? (
        <div className={`border p-5 ${calloutTones[section.callout.tone ?? "info"]}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-600">{section.callout.title}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Callout</div>
          </div>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">{section.callout.body}</p>
        </div>
      ) : null}

      {section.table ? (
        <div className="overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-950 text-left text-white">
                <tr>
                  {section.table.headers.map((header) => (
                    <th key={header} className="px-4 py-3 text-xs font-black uppercase tracking-[0.18em]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {section.table.rows.map((row, index) => (
                  <tr key={`${row.join("-")}-${index}`} className="border-t border-slate-200">
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`} className="px-4 py-4 align-top text-sm font-semibold leading-6 text-slate-700">
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

      {section.codeBlock ? (
        <div className="space-y-3">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{section.codeBlock.label}</div>
          <pre className="overflow-x-auto border border-slate-200 bg-slate-950 p-4 text-xs font-semibold leading-6 text-slate-100">
            <code>{section.codeBlock.code}</code>
          </pre>
        </div>
      ) : null}

      {section.links?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {section.links.map((link) => {
            const isInternal = link.href.startsWith("/");

            return (
              <div key={`${link.href}-${link.label}`} className="border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
                <div className="space-y-2">
                  <a href={link.href} className="text-sm font-black tracking-tight text-slate-950">
                    {link.label}
                  </a>
                  <p className="text-sm font-semibold leading-6 text-slate-600">{link.description}</p>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {isInternal ? "Internal route" : "External reference"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {section.note ? <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">{section.note}</div> : null}
    </section>
  );
}
