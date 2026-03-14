"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY:   Institutional platforms need cleaner, structured text input beyond plain textareas.
 * WHAT:  A custom rich text engine using native contenteditable with a professional Anan-style toolbar.
 * HOW:   Manages selection state and execCommand for core formatting while maintaining a clean, borderless aesthetic.
 */
interface AgRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AgRichTextEditor({ 
  value, 
  onChange, 
  placeholder = "ابدأ الكتابة هنا...", 
  className 
}: AgRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal content with external value only if they differ significantly
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execAction = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className={cn("group relative grid gap-2", className)}>
      {/* Premium Toolbar - Only visible on focus or hover */}
      <div className={cn(
        "flex items-center gap-1 border border-slate-200 bg-white p-1 transition-all duration-300",
        isFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <ToolbarButton icon={Heading1} onClick={() => execAction("formatBlock", "h1")} title="عنوان رئيسي" />
        <ToolbarButton icon={Heading2} onClick={() => execAction("formatBlock", "h2")} title="عنوان فرعي" />
        <div className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton icon={Bold} onClick={() => execAction("bold")} title="عريض" />
        <ToolbarButton icon={Italic} onClick={() => execAction("italic")} title="مائل" />
        <div className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton icon={List} onClick={() => execAction("insertUnorderedList")} title="قائمة" />
        <ToolbarButton icon={ListOrdered} onClick={() => execAction("insertOrderedList")} title="قائمة مرقمة" />
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "min-h-[200px] w-full border border-slate-200 bg-white p-6 text-lg font-medium leading-relaxed text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50",
            !value && "before:pointer-events-none before:absolute before:text-slate-400 before:content-[attr(data-placeholder)]"
          )}
          data-placeholder={placeholder}
        />
        {!isFocused && !value && (
            <Type className="absolute left-6 top-6 h-6 w-6 text-slate-100 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ 
  icon: Icon, 
  onClick, 
  title 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void; 
  title: string 
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
