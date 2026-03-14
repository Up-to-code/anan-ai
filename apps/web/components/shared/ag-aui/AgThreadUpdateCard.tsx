import { ArrowLeftRight, Clock3 } from "lucide-react";

export default function AgThreadUpdateCard({
  subject,
  sender,
  recipient,
  project,
  unit,
  status,
  update,
}: {
  subject: string;
  sender: string;
  recipient: string;
  project: string;
  unit?: string;
  status: string;
  update: string;
}) {
  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">آخر تحديث على الخيط</div>
          <h3 className="mt-1 text-base font-black text-slate-950">{subject}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm font-bold text-slate-700">
        <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2">
          <span>{sender}</span>
          <span className="text-xs text-slate-400">المرسل</span>
        </div>
        <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2">
          <span>{recipient}</span>
          <span className="text-xs text-slate-400">المستلم</span>
        </div>
        <div className="border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[10px] font-black tracking-[0.22em] text-slate-400">السياق</div>
          <div className="mt-1">{project}</div>
          <div className="mt-1 text-xs text-slate-500">{unit ?? "على مستوى المشروع"}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs font-black text-amber-600">
          <Clock3 className="h-3.5 w-3.5" />
          {status}
        </div>
        <div className="text-xs font-medium text-slate-500">{update}</div>
      </div>
    </section>
  );
}
