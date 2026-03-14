"use client";

import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "outline" | "ghost" | "dark" | "white";
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    href?: string;
}

export default function Button({
    children,
    variant = "primary",
    className = "",
    onClick,
    type = "button",
    href
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all active:scale-[0.98] rounded-none";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 px-8 py-2.5 text-xs font-black tracking-widest",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-5 text-sm font-black tracking-widest bg-white",
        ghost: "text-slate-900 hover:bg-slate-50 px-6 py-3 text-xs border-b-2 border-transparent hover:border-blue-600",
        dark: "bg-slate-900 text-white hover:bg-slate-800 px-12 py-5 text-sm font-black tracking-widest",
        white: "bg-white text-blue-600 hover:bg-slate-50 px-12 py-5 text-sm font-black tracking-widest"
    };

    const content = (
        <span className="flex items-center gap-3">
            {children}
        </span>
    );

    if (href) {
        return (
            <a
                href={href}
                className={`${baseStyles} ${variants[variant]} ${className}`}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {content}
        </button>
    );
}
