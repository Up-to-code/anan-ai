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

function EditorToolbar({
  isFocused,
  execAction,
}: {
  isFocused: boolean;
  execAction: (command: string, value?: string) => void;
}) {
  return (
    <div className={cn("flex items-center gap-1 rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-1 transition-all duration-300", isFocused ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0")}>
      <ToolbarButton icon={Heading1} onClick={() => execAction("formatBlock", "h1")} title="عنوان رئيسي" />
      <ToolbarButton icon={Heading2} onClick={() => execAction("formatBlock", "h2")} title="عنوان فرعي" />
      <div className="mx-1 h-4 w-px bg-[color:var(--workspace-border)]" />
      <ToolbarButton icon={Bold} onClick={() => execAction("bold")} title="عريض" />
      <ToolbarButton icon={Italic} onClick={() => execAction("italic")} title="مائل" />
      <div className="mx-1 h-4 w-px bg-[color:var(--workspace-border)]" />
      <ToolbarButton icon={List} onClick={() => execAction("insertUnorderedList")} title="قائمة" />
      <ToolbarButton icon={ListOrdered} onClick={() => execAction("insertOrderedList")} title="قائمة مرقمة" />
    </div>
  );
}

function EditorSurface({
  editorRef,
  handleInput,
  isFocused,
  placeholder,
  setIsFocused,
  value,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  handleInput: () => void;
  isFocused: boolean;
  placeholder: string;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
}) {
  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn("min-h-[200px] w-full rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-6 text-lg font-medium leading-relaxed text-[var(--workspace-bubble-other-foreground)] outline-none transition-all focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)]", !value && "before:pointer-events-none before:absolute before:text-[var(--workspace-muted)] before:content-[attr(data-placeholder)]")}
        data-placeholder={placeholder}
      />
      {!isFocused && !value ? <Type className="pointer-events-none absolute left-6 top-6 h-6 w-6 text-[color:color-mix(in_srgb,var(--workspace-muted)_35%,transparent)]" /> : null}
    </div>
  );
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
  }, [value]);

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
      <EditorToolbar isFocused={isFocused} execAction={execAction} />
      <EditorSurface editorRef={editorRef} handleInput={handleInput} isFocused={isFocused} placeholder={placeholder} setIsFocused={setIsFocused} value={value} />
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
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-accent-soft)] hover:text-[var(--workspace-highlight)]"
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
