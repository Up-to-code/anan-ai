/**
 * ChatMessageList.tsx — Scrollable conversation container
 *
 * Wraps messages in a scroll-area with auto-scroll-to-bottom
 * and a "scroll to bottom" button when the user scrolls up.
 * Follows Shadcn Conversation pattern.
 */
import { useRef, useEffect, useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/_core/lib/utils";

interface ChatMessageListProps {
    children: ReactNode;
    className?: string;
}

export function ChatMessageList({ children, className }: ChatMessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        // Auto-scroll on new children
        const el = scrollRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (isNearBottom) scrollToBottom();
    });

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        setShowScrollBtn(!isNearBottom);
    };

    return (
        <div className={cn("relative flex-1 min-h-0", className)}>
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto scroll-smooth px-4 py-6 space-y-1"
            >
                {children}
            </div>
            {showScrollBtn && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg hover:bg-slate-800 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <ArrowDown className="h-3 w-3" />
                    آخر الرسائل
                </button>
            )}
        </div>
    );
}
