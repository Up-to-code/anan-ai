import { CircleHelp } from "lucide-react";

export default function AgMissingDataPrompt({
  prompt,
}: {
  prompt: string;
}) {
  return (
    <section className="w-full max-w-[340px] border border-dashed border-blue-200 bg-blue-50/70 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-blue-200 bg-white text-blue-700">
          <CircleHelp className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">سؤال متابعة</div>
          <p className="mt-1 text-sm font-black leading-7 text-slate-900">{prompt}</p>
        </div>
      </div>
    </section>
  );
}
