"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LegalArticleProps {
    title: ReactNode;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
}

export default function LegalArticle({
    title,
    children,
    className,
    titleClassName,
}: LegalArticleProps) {
    return (
        <article className={cn(className)}>
            <h2 className={cn(titleClassName)}>{title}</h2>
            {children}
        </article>
    );
}
