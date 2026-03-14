import { ImagePlus, CloudUpload, X, CheckCircle2 } from "lucide-react";

export default function AgImageUploader() {
    return (
        <div className="w-full bg-white p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between   pb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-blue-50 text-blue-600 font-bold">
                        <ImagePlus className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">بوابة الوسائط</div>
                        <h3 className="text-sm font-black text-slate-900">رفع صور العقار</h3>
                    </div>
                </div>
            </div>

            <div className="  bg-slate-50/50 p-12 text-center transition hover:border-blue-600 group cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center bg-white   group-hover:border-blue-600 transition">
                        <CloudUpload className="h-8 w-8 text-slate-300 group-hover:text-blue-600 transition" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-relaxed">اسحب الصور وأفلتها هنا، أو اضغط للتصفح</div>
                        <p className="mt-1 text-[10px] font-bold text-slate-400">PNG, JPG, WEBP (بحد أقصى 10 ميجابايت للصورة)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="aspect-square bg-slate-100   relative group overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <ImagePlus className="h-8 w-8" />
                        </div>
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button className="p-2 bg-white text-slate-900 hover:bg-blue-600 hover:text-white transition">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="absolute right-2 top-2 h-5 w-5 bg-green-500 flex items-center justify-center text-white">
                            <CheckCircle2 className="h-3 w-3" />
                        </div>
                    </div>
                ))}
                <button className="aspect-square   bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-600 hover:text-blue-600 transition">
                    <Plus className="h-6 w-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">إضافة صورة</span>
                </button>
            </div>

            <button className="w-full   bg-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-blue-600 hover:border-blue-600 transition">
                اتمام عملية الرفع (3 صور)
            </button>
        </div>
    );
}
import { Plus } from "lucide-react";
