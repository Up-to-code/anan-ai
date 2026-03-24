import CodeSnippet from "./CodeSnippet";
import ScopeBadge from "./ScopeBadge";
import type { DocsEndpoint } from "@/lib/docs/types";
import { Badge } from "@/components/ui/badge";

function methodClassName(method: DocsEndpoint["method"]) {
  return method === "GET"
    ? "bg-emerald-500 text-white"
    : method === "POST"
    ? "bg-indigo-600 text-white"
    : "bg-amber-500 text-white";
}

export default function EndpointCard({ endpoint }: { endpoint: DocsEndpoint }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-none border-2 border-slate-900 bg-white">
      <div className="flex flex-col gap-4 border-b-2 border-slate-100 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`rounded-none px-3 py-1 text-xs font-black uppercase tracking-widest ${methodClassName(endpoint.method)}`}>
            {endpoint.method}
          </Badge>
          <code className="rounded-none bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-900 border-2 border-slate-100">{endpoint.path}</code>
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-wider text-slate-900">{endpoint.title}</h3>
          <p className="mt-2 text-base font-medium leading-relaxed text-slate-500">{endpoint.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 p-8">
        {endpoint.requiredScopes && endpoint.requiredScopes.length > 0 ? (
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Required Scopes</div>
            <div className="grid gap-3 md:grid-cols-2">
              {endpoint.requiredScopes.map((scope) => (
                <ScopeBadge key={scope} scopeId={scope} />
              ))}
            </div>
          </div>
        ) : null}

        {endpoint.notes && endpoint.notes.length > 0 ? (
          <ul className="list-disc space-y-2 pl-6 text-sm font-medium leading-relaxed text-slate-600 marker:text-slate-300">
            {endpoint.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}

        {(endpoint.requestExample || endpoint.responseExample) && (
          <div className="flex flex-col gap-6 pt-6 border-t-2 border-slate-100">
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
