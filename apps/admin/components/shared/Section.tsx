"use client";

import { ReactNode } from "react";

interface SectionProps {
    children: ReactNode;
    className?: string;
    containerClassName?: string;
    id?: string;
    bg?: "white" | "slate" | "dark" | "primary" | "none";
    border?: boolean;
}

export default function Section({
    children,
    className = "",
    containerClassName = "",
    id,
    bg = "white",
    border = false
}: SectionProps) {
    const backgrounds = {
        white: "bg-white text-slate-900",
        slate: "bg-[#F8FAFC] text-slate-900",
        dark: "bg-[#0F172A] text-white",
        primary: "bg-[#2563EB] text-white",
        none: ""
    };

    return (
        <section
            id={id}
            className={`py-24 md:py-32 px-6 ${backgrounds[bg]} ${border ? "border-b-2 border-slate-100" : ""} ${className}`}
        >
            <div className={`max-w-[1400px] mx-auto ${containerClassName}`}>
                {children}
            </div>
        </section>
    );
}
