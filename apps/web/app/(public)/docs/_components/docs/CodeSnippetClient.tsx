"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeSnippetClient({
  title,
  language,
  code,
  html,
}: {
  title: string;
  language: string;
  code: string;
  html: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#0d1117] text-slate-50 shadow-sm [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4 [&_code]:font-mono [&_code]:text-[13px] [&_code]:leading-6">
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b22] px-4 py-2.5">
        <div className="text-xs font-semibold text-slate-300">{title}</div>
        <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{language}</div>
      </div>
      <div className="relative p-0 overflow-x-auto">
        <button
          onClick={copyToClipboard}
          className="absolute right-3 top-3 z-10 hidden rounded-md border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 backdrop-blur transition-all hover:bg-slate-700 hover:text-slate-100 group-hover:flex"
          aria-label="Copy code"
        >
          {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
