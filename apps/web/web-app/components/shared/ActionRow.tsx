"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionRowProps {
    children: ReactNode;
    className?: string;
}

export default function ActionRow({ children, className }: ActionRowProps) {
    return <div className={cn(className)}>{children}</div>;
}
