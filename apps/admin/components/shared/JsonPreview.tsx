import { cn } from "@/lib/utils";

type JsonPreviewProps = {
  value: unknown;
  className?: string;
};

/**
 * WHY:   Several admin detail panels expose raw operational payloads that are easiest to inspect as JSON.
 * WHAT:  Renders a safe, formatted JSON block.
 * HOW:   Serializes with indentation and uses monospace styling inside a bordered panel.
 */
export default function JsonPreview({ value, className }: JsonPreviewProps) {
  return (
    <pre
      className={cn(
        "overflow-x-auto border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 shadow-sm",
        className,
      )}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
