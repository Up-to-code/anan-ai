import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "dark" | "white" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  href?: string;
  disabled?: boolean;
}

/**
 * WHY:   Admin actions need one token-driven button system so forms, toolbars, and shell actions stay visually aligned.
 * WHAT:  Renders the shared button primitive with workspace-aware variants and geometry.
 * HOW:   Combines a stable interaction base with themed variants that rely on workspace tokens instead of page-local colors.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  href,
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-black transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 active:scale-[0.98]";
  
  const sizes = {
    sm: "h-10 rounded-2xl px-4 text-[11px] uppercase tracking-[0.16em]",
    md: "h-11 rounded-2xl px-5 text-[12px] uppercase tracking-[0.16em]",
    lg: "h-12 rounded-[20px] px-6 text-[13px] uppercase tracking-[0.16em]",
  };

  const variants = {
    primary:
      "border border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[var(--workspace-highlight)] text-white shadow-sm hover:bg-[var(--workspace-highlight-strong)]",
    outline:
      "border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)] shadow-sm hover:bg-[var(--workspace-elevated)]",
    ghost:
      "border border-transparent bg-transparent text-[var(--workspace-muted)] hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)]",
    dark:
      "border border-[color:color-mix(in_srgb,var(--workspace-sidebar-strong)_90%,transparent)] bg-[var(--workspace-sidebar-strong)] text-white shadow-sm hover:brightness-110",
    white:
      "border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:bg-[var(--workspace-panel)] dark:text-[var(--workspace-bubble-other-foreground)] dark:hover:bg-[var(--workspace-elevated)]",
    danger:
      "border border-rose-500/20 bg-rose-500 text-white shadow-sm hover:bg-rose-600",
  };

  const content = <span className="flex items-center gap-2.5">{children}</span>;

  const combinedClassName = cn(baseStyles, sizes[size], variants[variant], className);

  if (href) {
    return <Link href={href} className={combinedClassName}>{content}</Link>;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {content}
    </button>
  );
}
