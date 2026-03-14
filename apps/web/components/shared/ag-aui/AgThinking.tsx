import { Sparkles, Bot, Loader2 } from "lucide-react";

export default function AgThinking() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 bg-slate-950 border-slate-950 text-white">
                    <Bot className="h-5 w-5" />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="inline-block p-6 bg-white   text-right rounded-none">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm font-bold text-slate-500">جاري المعالجة والتحليل...</span>
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                            <div className="h-2 w-32 bg-slate-50   animate-pulse" />
                            <div className="h-2 w-48 bg-slate-50   animate-pulse delay-75" />
                            <div className="h-2 w-24 bg-slate-50   animate-pulse delay-150" />
                        </div>
                    </div>

                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        تفكير أنان العقاري...
                    </div>
                </div>
            </div>
        </div>
    );
}
