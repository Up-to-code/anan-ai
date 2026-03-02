/**
 * ChatBubble.tsx — Individual message bubble
 *
 * Renders user and assistant messages with distinct styling.
 * Supports: streaming indicator, collapsible reasoning blocks,
 * source citations, and markdown-ready content.
 * Follows Shadcn Message pattern.
 */
import { useState } from "react";
import {
    Bot,
    User,
    Loader2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Sparkles,
} from "lucide-react";
import { cn } from "@/_core/lib/utils";
import type { AssistantMessage } from "../types";

interface ChatBubbleProps {
    message: AssistantMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isAssistant = message.role === "assistant";
    const isStreaming = message.streamState === "streaming";
    const [showReasoning, setShowReasoning] = useState(false);

    return (
        <div
            className={cn(
                "flex gap-3 py-3 group",
                isAssistant ? "flex-row" : "flex-row-reverse",
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                    isAssistant
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500/20 text-white"
                        : "bg-white border-slate-200 text-slate-600",
                )}
            >
                {isAssistant ? (
                    <Bot className="h-4 w-4" />
                ) : (
                    <User className="h-4 w-4" />
                )}
            </div>

            {/* Content */}
            <div
                className={cn(
                    "flex flex-col gap-1.5 max-w-[85%]",
                    !isAssistant && "items-end",
                )}
            >
                {/* Role label */}
                <span
                    className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        isAssistant ? "text-slate-400" : "text-blue-400",
                    )}
                >
                    {isAssistant ? "anan-ai" : "أنت"}
                    {isStreaming && (
                        <Loader2 className="inline h-3 w-3 animate-spin mr-1 text-blue-500" />
                    )}
                </span>

                {/* Message body */}
                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        isAssistant
                            ? "bg-white border border-slate-200 text-slate-700 rounded-tr-md"
                            : "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tl-md",
                    )}
                >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                </div>

                {/* Reasoning block (collapsible) */}
                {message.reasoning && (
                    <button
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors mt-1"
                    >
                        <Sparkles className="h-3 w-3" />
                        {showReasoning ? "إخفاء التحليل" : "عرض التحليل"}
                        {showReasoning ? (
                            <ChevronUp className="h-3 w-3" />
                        ) : (
                            <ChevronDown className="h-3 w-3" />
                        )}
                    </button>
                )}
                {message.reasoning && showReasoning && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-[11px] text-slate-500 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                        {message.reasoning}
                    </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {message.sources.map((source) => (
                            <a
                                key={source.href}
                                href={source.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                                <ExternalLink className="h-2.5 w-2.5" />
                                {source.title}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
