import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]" onClick={() => setIsOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 border-b">
                    <Search className="h-5 w-5 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="ابحث عن صفحة أو أمر..."
                        className="flex-1 py-4 text-sm outline-none placeholder:text-slate-400"
                        autoFocus
                    />
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-2 max-h-[300px] overflow-y-auto">
                    <p className="text-xs text-slate-400 px-3 py-2">لا توجد نتائج</p>
                </div>
            </div>
        </div>
    );
}
