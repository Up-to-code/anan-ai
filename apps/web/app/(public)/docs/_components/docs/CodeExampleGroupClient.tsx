"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { DocsCodeExample, DocsCodeExampleGroup } from "@/lib/docs/types";

type ExampleWithHtml = DocsCodeExample & { html: string };

function languageLabel(language: DocsCodeExample["language"]) {
  switch (language) {
    case "typescript":
      return "TypeScript";
    case "javascript":
      return "JavaScript";
    case "csharp":
      return "C# / .NET";
    case "bash":
      return "cURL";
    case "json":
      return "JSON";
    default:
      return language;
  }
}

export function CodeExampleGroupClient({
  group,
  examples,
}: {
  group: DocsCodeExampleGroup;
  examples: ExampleWithHtml[];
}) {
  const defaultIndex = useMemo(() => {
    const wanted = group.defaultLanguage ?? "typescript";
    const found = examples.findIndex((example) => example.language === wanted);
    return found >= 0 ? found : 0;
  }, [examples, group.defaultLanguage]);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [isCopied, setIsCopied] = useState(false);
  const activeExample = examples[activeIndex];

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(activeExample.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#0d1117] text-slate-50 shadow-sm">
      <div className="border-b border-slate-800 bg-[#161b22] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-200">{group.title}</div>
            {group.description ? <div className="mt-1 text-[11px] text-slate-400">{group.description}</div> : null}
          </div>
          <div className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/70 p-1">
            {examples.map((example, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={`${group.title}-${example.language}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    active ? "bg-slate-100 text-slate-950" : "text-slate-400 hover:text-slate-100"
                  }`}
                  aria-pressed={active}
                >
                  {languageLabel(example.language)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="relative overflow-x-auto [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4 [&_code]:font-mono [&_code]:text-[13px] [&_code]:leading-6">
        <button
          onClick={copyToClipboard}
          className="absolute right-3 top-3 z-10 hidden rounded-md border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 backdrop-blur transition-all hover:bg-slate-700 hover:text-slate-100 group-hover:flex"
          aria-label="Copy code"
        >
          {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
        <div dangerouslySetInnerHTML={{ __html: activeExample.html }} />
      </div>
    </div>
  );
}
