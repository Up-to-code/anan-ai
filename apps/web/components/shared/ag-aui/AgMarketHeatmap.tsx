import { Map as MapIcon, Layers, Maximize2, ZoomIn, Info } from "lucide-react";

function stableRand01(seed: number) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

/**
 * WHY:   Market intelligence needs quick spatial intuition, even before real map data is integrated.
 * WHAT:  Renders a mock heatmap grid with hover tooltips for neighborhood pricing density.
 * HOW:   Uses deterministic pseudo-random values (pure) for stable visuals without calling `Math.random()` during render.
 */
export default function AgMarketHeatmap() {
    // Mock grid for heatmap density
    const grid = Array.from({ length: 16 }, (_, index) => stableRand01(index + 1));

    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                        <Layers className="h-4 w-4" />
                        خريطة كثافة الأسعار
                    </div>
                    <h3 className="mt-1 text-xl font-black text-slate-900 tracking-tight">أحياء شمال الرياض</h3>
                </div>
                <div className="flex gap-2">
                    <button className="p-2   hover:border-blue-600 hover:text-blue-600 transition">
                        <Maximize2 className="h-4 w-4" />
                    </button>
                    <button className="p-2   hover:border-blue-600 hover:text-blue-600 transition">
                        <ZoomIn className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 aspect-square md:aspect-video bg-slate-50   p-4 relative overflow-hidden">
                {grid.map((opacity, i) => (
                    <div
                        key={i}
                        className="group relative flex items-center justify-center border border-white/20 transition-all hover:border-blue-600 cursor-crosshair"
                        style={{
                            backgroundColor: `rgba(37, 99, 235, ${opacity * 0.8})`
                        }}
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-950/80 p-2 flex flex-col justify-center text-center items-center z-10">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">حي {i + 101}</span>
                            <span className="text-[10px] font-black text-blue-400 mt-1">{Math.floor(opacity * 15000 + 5000)} ر.س/م²</span>
                        </div>
                    </div>
                ))}
                {/* Mock Map Overlay */}
                <div className="absolute inset-0 pointer-events-none  /10 mix-blend-overlay">
                    <MapIcon className="w-full h-full opacity-5" />
                </div>
            </div>

            <div className="flex items-center justify-between   pt-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-100 border border-blue-200" />
                        <span className="text-[10px] font-black uppercase text-slate-400">سعر منخفض</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-600" />
                        <span className="text-[10px] font-black uppercase text-slate-400">سعر مرتفع</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Info className="h-3.5 w-3.5" />
                    <span>البيانات محدثة بناءً على آخر 30 يوم</span>
                </div>
            </div>
        </div>
    );
}
