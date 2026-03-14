"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface CardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "default" | "dark" | "accent";
    className?: string;
    children?: ReactNode;
}

export default function Card({
    title,
    description,
    icon: Icon,
    variant = "default",
    className = "",
    children
}: CardProps) {
    const variants = {
        default: "bg-white border-2 border-slate-100 hover:border-blue-600",
        dark: "bg-slate-900 border-2 border-slate-800 text-white",
        accent: "bg-blue-600/5 border-2 border-blue-600/20 hover:border-blue-600"
    };

    return (
        <div className={`p-12 space-y-8 transition-all group rounded-none ${variants[variant]} ${className}`}>
            {Icon && (
                <div className={`h-12 w-12 flex items-center justify-center ${variant === "dark" ? "bg-blue-600/20" : "bg-blue-600/10"}`}>
                    <Icon className={`h-6 w-6 ${variant === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                </div>
            )}
            <div className="space-y-3">
                <h3 className={`text-xl font-black uppercase tracking-tight ${variant === "dark" ? "text-white" : "text-slate-900"}`}>
                    {title}
                </h3>
                <p className={`text-sm font-bold leading-relaxed ${variant === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {description}
                </p>
            </div>
            {children && <div className="pt-4">{children}</div>}
        </div>
    );
}
