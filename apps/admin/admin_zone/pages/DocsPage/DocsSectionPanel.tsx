import { cn } from "@/lib/utils";
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
  const calloutTonesStyles = {
    info: "border-primary/20 bg-primary/5 text-foreground",
    warn: "border-amber-500/20 bg-amber-500/5 text-foreground",
    success: "border-emerald-500/20 bg-emerald-500/5 text-foreground",
  };

  return (
    <section id={sectionId} className="scroll-mt-24 space-y-8 border-t border-border/20 pt-16 first:border-t-0 first:pt-0">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-foreground">{section.title}</h2>
      </div>

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="text-sm font-bold leading-relaxed text-muted-foreground/70">
          {paragraph}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul className="grid gap-3">
          {section.bullets.map((item) => (
            <li
              key={item}
              className="group relative rounded-2xl border border-border/30 bg-muted/5 ps-6 pe-6 py-4 text-[13px] font-bold leading-relaxed text-muted-foreground/70 transition-all hover:bg-muted/10"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {section.callout ? (
        <div className={cn("rounded-2xl border p-6 shadow-sm", calloutTonesStyles[section.callout.tone ?? "info"])}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{section.callout.title}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Notice</div>
          </div>
          <p className="mt-3 text-[13px] font-bold leading-relaxed opacity-90">{section.callout.body}</p>
        </div>
      ) : null}

      {section.table ? (
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-muted/5">
                <tr>
                  {section.table.headers.map((header) => (
                    <th key={header} className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 border-b border-border/20">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {section.table.rows.map((row, index) => (
                  <tr key={`${row.join("-")}-${index}`} className="transition-colors hover:bg-muted/5">
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`} className="px-5 py-5 align-top text-[13px] font-bold leading-relaxed text-muted-foreground/70">
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
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{section.codeBlock.label}</div>
          <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-6 text-[12px] font-bold leading-relaxed text-slate-300 shadow-inner">
            <code>{section.codeBlock.code}</code>
          </pre>
        </div>
      ) : null}

      {section.links?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {section.links.map((link) => {
            const isInternal = link.href.startsWith("/");

            return (
              <a key={`${link.href}-${link.label}`} href={link.href} className="group block rounded-2xl border border-border/30 bg-card p-6 shadow-sm transition-all hover:bg-muted/5 hover:border-primary/30">
                <div className="space-y-2">
                  <div className="text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </div>
                  <p className="text-[12px] font-bold leading-relaxed text-muted-foreground/60">{link.description}</p>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 pt-2 border-t border-border/10 mt-2">
                    {isInternal ? "Internal route" : "External reference"}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : null}

      {section.note ? (
        <div className="rounded-2xl border border-dashed border-border/40 bg-muted/5 p-6 text-[13px] font-bold leading-relaxed text-muted-foreground/60">
          {section.note}
        </div>
      ) : null}
    </section>
  );
}
