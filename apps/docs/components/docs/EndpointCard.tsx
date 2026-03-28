import CodeSnippet from "./CodeSnippet";
import ScopeBadge from "./ScopeBadge";
import type { DocsEndpoint } from "@/lib/docs/types";
import { Badge } from "@/components/ui/badge";

function methodClassName(method: DocsEndpoint["method"]) {
  return method === "GET"
    ? "bg-emerald-500 text-white"
    : method === "POST"
    ? "bg-indigo-600 text-white"
    : method === "PATCH"
    ? "bg-amber-500 text-white"
    : "bg-rose-600 text-white";
}

export default function EndpointCard({ endpoint }: { endpoint: DocsEndpoint }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/10 dark:bg-[#0c0c0f] dark:shadow-none">
      <div className="flex flex-col gap-4 border-b border-black/5 p-8 dark:border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] border-none shadow-sm ${methodClassName(endpoint.method)}`}>
            {endpoint.method}
          </Badge>
          <code className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-900 border border-slate-200 shadow-sm dark:bg-[#18181b] dark:text-slate-200 dark:border-white/10">{endpoint.path}</code>
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">{endpoint.title}</h3>
          <p className="mt-2 text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400">{endpoint.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-8">
        {endpoint.requiredScopes && endpoint.requiredScopes.length > 0 ? (
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">Required Scopes</div>
            <div className="grid gap-3 md:grid-cols-2">
              {endpoint.requiredScopes.map((scope) => (
                <ScopeBadge key={scope} scopeId={scope} />
              ))}
            </div>
          </div>
        ) : null}

        {endpoint.notes && endpoint.notes.length > 0 ? (
          <ul className="list-disc space-y-2 pl-6 text-sm font-medium leading-relaxed text-slate-600 marker:text-slate-300 dark:text-slate-300 dark:marker:text-slate-600">
            {endpoint.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}

        {(endpoint.requestExample || endpoint.responseExample) && (
          <div className="flex flex-col gap-6 pt-6 border-t border-black/5 dark:border-white/5">
            <div className="grid gap-6 lg:grid-cols-2">
              {endpoint.requestExample ? <CodeSnippet example={endpoint.requestExample} /> : null}
              {endpoint.responseExample ? <CodeSnippet example={endpoint.responseExample} /> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
