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
 * WHY:   Buttons in Nexus need to be high-contrast, rounded-full, and professional.
 * WHAT:  Modernizes the universal Button with premium geometry and active tracking.
 * HOW:   Uses rounded-full for primary actions and rounded-2xl for utility buttons.
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
  const baseStyles = "inline-flex items-center justify-center font-black transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95";
  
  const sizes = {
    sm: "h-10 px-6 text-[11px] rounded-full uppercase tracking-widest",
    md: "h-12 px-8 text-[12px] rounded-full uppercase tracking-widest",
    lg: "h-14 px-10 text-[14px] rounded-full uppercase tracking-widest",
  };

  const variants = {
    primary: "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white shadow-md",
    outline: "border border-slate-100 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost: "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-100",
    dark: "bg-slate-950 text-white hover:bg-slate-900",
    white: "border border-slate-100 bg-white text-slate-900 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md",
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
