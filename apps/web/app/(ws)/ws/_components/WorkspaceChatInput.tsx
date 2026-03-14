"use client";

import { useRef, useState } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY:   The workspace landing state needs one branded AI input entry instead of a generic textarea + icon button.
 * WHAT:  Renders the welcome prompt input with auto-resize plus microphone/send controls.
 * HOW:   Tracks textarea content locally while keeping the animated brand mark only in the assistant identity surfaces.
 */
export default function WorkspaceChatInput({
    onChatActive
}: {
    onChatActive?: (active: boolean) => void;
} = {}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");
    const [isChatting, setIsChatting] = useState(false);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);

        // Auto-resize logic
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Handle send logic here
            console.log("Send:", value);
            setValue("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    return (
        <div className={cn(
            "w-full transition-all duration-700 ease-in-out",
            isChatting ? "flex-1 flex flex-col h-[500px]" : ""
        )}>
            {isChatting && (
                <div className="flex-1 overflow-y-auto p-4 mb-4 space-y-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-600 text-white font-black">أ</div>
                        <div className="bg-white border border-slate-200 p-4 rounded-none text-slate-700 w-full max-w-2xl shadow-none">
                            أهلاً بك. أنا أنان، مساعدك الذكي. كيف يمكنني مساعدتك في مهامك العقارية اليوم؟
                        </div>
                    </div>
                </div>
            )}
            <div className={cn(
                "relative border-2 border-slate-200 bg-white p-2 transition-all focus-within:border-blue-600",
                !isChatting && "mt-12 group hover:border-blue-400"
            )}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="اسأل أنان، أو ابدأ بإنشاء عرض، أو ابحث في مشاريعك..."
                    className="w-full resize-none bg-transparent px-5 py-5 text-lg font-black text-slate-900 placeholder-slate-400 outline-none"
                    rows={1}
                    style={{ minHeight: "85px", maxHeight: "240px", overflowY: value.split('\n').length > 5 ? 'auto' : 'hidden' }}
                />
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex flex-wrap gap-2 px-2 hidden sm:flex">
                        {!isChatting && (
                            <>
                                <button className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
                                    إنشاء عرض لعميل
                                </button>
                                <button className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
                                    تحليل سوق الملقا
                                </button>
                            </>
                        )}
                        {isChatting && (
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                                جاري التفكير...
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 sm:ms-auto">
                        <button
                            type="button"
                            className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-blue-600"
                        >
                            <Mic className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => {
                                if (!value.trim()) return;
                                setIsChatting(true);
                                onChatActive?.(true);
                                console.log("Send:", value);
                                setValue("");
                                if (textareaRef.current) {
                                    textareaRef.current.style.height = "auto";
                                }
                            }}
                            disabled={!value.trim()}
                            className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center bg-slate-950 text-white transition-colors",
                                value.trim() ? "hover:bg-blue-600 cursor-pointer" : "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ArrowUp className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
