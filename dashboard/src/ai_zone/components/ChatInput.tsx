/**
 * ChatInput.tsx — Premium prompt input
 *
 * Auto-resizing textarea with send button, keyboard shortcut,
 * and disabled state handling. Follows Shadcn Prompt Input pattern.
 */
import { useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/_core/lib/utils";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    disabled = false,
    placeholder = "اسأل Anan-AI عن أي شيء...",
    className,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) onSubmit();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        adjustHeight();
    };

    return (
        <div
            className={cn(
                "relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:border-blue-300 focus-within:shadow-md focus-within:shadow-blue-100/50",
                className,
            )}
        >
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                disabled={disabled}
                className={cn(
                    "flex-1 resize-none bg-transparent px-3 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none disabled:opacity-50",
                    "min-h-[44px] max-h-[200px]",
                )}
                dir="auto"
            />
            <button
                type="button"
                onClick={onSubmit}
                disabled={disabled || !value.trim()}
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                    value.trim() && !disabled
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed",
                )}
            >
                {disabled ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
