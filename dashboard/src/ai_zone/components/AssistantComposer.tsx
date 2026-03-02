import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export function AssistantComposer({
  onSubmit,
  disabled,
}: {
  onSubmit: (message: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    const message = value;
    setValue("");
    await onSubmit(message);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="اسأل anan assistance عن المبيعات، العروض، أو العقارات..."
        className="min-h-[56px] flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        إرسال
      </button>
    </form>
  );
}
