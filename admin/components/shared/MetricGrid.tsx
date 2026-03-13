"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricItem {
    value: ReactNode;
    label: ReactNode;
}

interface MetricGridProps {
    items: MetricItem[];
    className?: string;
    itemClassName?: string;
    valueClassName?: string;
    labelClassName?: string;
}

export default function MetricGrid({
    items,
    className,
    itemClassName,
    valueClassName,
    labelClassName,
}: MetricGridProps) {
    return (
        <div className={cn(className)}>
            {items.map((item, index) => (
                <div key={index} className={cn(itemClassName)}>
                    <span className={cn(valueClassName)}>{item.value}</span>
                    <span className={cn(labelClassName)}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}
