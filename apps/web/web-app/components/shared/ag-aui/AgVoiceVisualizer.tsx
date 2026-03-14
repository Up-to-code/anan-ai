import { Mic, X, Waves } from "lucide-react";

/**
 * WHY:   Voice input is a core multi-channel affordance for Arabic-first property search.
 * WHAT:  Renders a mock voice listening UI with animated bars and an example utterance.
 * HOW:   Uses static animation styles only; does not start audio capture or attach event handlers.
 */
export default function AgVoiceVisualizer() {
    return (
        <div className="w-full bg-white p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <Waves className="h-full w-full" />
            </div>

            <div className="relative">
                <div className="absolute inset-0 animate-ping   rounded-none opacity-20" />
                <div className="relative flex h-24 w-24 items-center justify-center bg-blue-600 text-white z-10 transition-transform hover:scale-105 cursor-pointer">
                    <Mic className="h-10 w-10 animate-pulse" />
                </div>
            </div>

            <div className="mt-12 flex flex-col gap-4 relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">جاري الاستماع...</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">تحدث الآن للبحث عن عقارات</h3>
                <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">
                    يمكنك قول: &quot;ابحث لي عن فلل في الياسمين بسعر أقل من 5 مليون ريال&quot;
                </p>
            </div>

            <div className="mt-12 flex items-center justify-center gap-1.5 h-8">
                {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.4].map((h, i) => (
                    <div
                        key={i}
                        className="w-1.5 bg-blue-600 animate-pulse"
                        style={{
                            height: `${h * 100}%`,
                            animationDelay: `${i * 0.1}s`
                        }}
                    />
                ))}
            </div>

            <button className="absolute top-6 right-6 p-2   text-slate-400 hover:border-red-600 hover:text-red-600 transition">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
