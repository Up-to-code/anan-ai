import { Phone, PhoneOff, Mic, UserPlus, MessageCircle, Play, Pause, History } from "lucide-react";

export default function AgCallPortal() {
    return (
        <div className="w-full bg-white overflow-hidden">
            <div className="bg-slate-950 p-8 text-white flex flex-col items-center text-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping   rounded-none opacity-20" />
                    <div className="relative h-20 w-20 bg-blue-600 flex items-center justify-center z-10">
                        <Phone className="h-8 w-8 animate-pulse" />
                    </div>
                </div>

                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">اتصال AI آمن</div>
                    <h3 className="mt-2 text-2xl font-black tracking-tight">جاري الاتصال بالوكيل</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">أخصائي مشروع الملقا</p>
                </div>

                <div className="flex items-center gap-4 py-4">
                    {[1, 2, 3, 2, 4, 1, 3, 2].map((h, i) => (
                        <div key={i} className="w-1 bg-blue-600/50 animate-pulse" style={{ height: h * 8, animationDelay: `${i * 0.1}s` }} />
                    ))}
                    <span className="text-xl font-mono font-black text-blue-400">00:12</span>
                    {[1, 2, 3, 2, 4, 1, 3, 2].map((h, i) => (
                        <div key={i} className="w-1 bg-blue-600/50 animate-pulse" style={{ height: h * 8, animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            </div>

            <div className="p-8 grid grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-2 p-4   hover:border-blue-600 hover:text-blue-600 transition rounded-none">
                    <Mic className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase">كتم</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4   hover:border-blue-600 hover:text-blue-600 transition rounded-none">
                    <UserPlus className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase">إضافة فريق</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4   hover:border-blue-600 hover:text-blue-600 transition rounded-none">
                    <Pause className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase">انتظار</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition rounded-none">
                    <PhoneOff className="h-5 w-5" />
                    <span className="text-[8px] font-black uppercase">إنهاء</span>
                </button>
            </div>

            <div className="bg-slate-50 p-6 border-t-2 border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History className="h-4 w-4 text-slate-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400">مدة الاتصال السابق: 12:40</span>
                </div>
                <button className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 hover:underline">
                    سجل المكالمات
                    <Play className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
