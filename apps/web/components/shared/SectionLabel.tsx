"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
    icon?: LucideIcon;
    children: ReactNode;
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

export default function SectionLabel({
    icon: Icon,
    children,
    className,
    iconClassName,
    textClassName,
}: SectionLabelProps) {
    return (
        <div className={className}>
            {Icon && <Icon className={iconClassName} />}
            <span className={cn(textClassName)}>{children}</span>
        </div>
    );
}
