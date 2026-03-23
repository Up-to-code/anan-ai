"use client";

import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "outline" | "ghost" | "dark" | "white";
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    href?: string;
    disabled?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    className = "",
    onClick,
    type = "button",
    href,
    disabled = false,
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-[8px] text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 px-4 py-2",
        outline: "border border-border bg-white text-slate-900 hover:bg-slate-50 px-4 py-2",
        ghost: "text-slate-700 hover:bg-slate-100 px-4 py-2",
        dark: "bg-slate-900 text-white hover:bg-slate-800 px-4 py-2",
        white: "border border-border bg-white text-slate-900 hover:bg-slate-50 px-4 py-2"
    };
    const content = <span className="flex items-center gap-3">{children}</span>;
    if (href) {
        return <a href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>{content}</a>;
    }
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {content}
        </button>
    );
}
