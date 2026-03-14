"use client";

import { LucideIcon } from "lucide-react";
import Card from "@/components/shared/Card";
import { cn } from "@/lib/utils";

interface FeatureCardItem {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "default" | "dark" | "accent";
    className?: string;
}

interface FeatureCardGridProps {
    items: FeatureCardItem[];
    className?: string;
}

export default function FeatureCardGrid({
    items,
    className,
}: FeatureCardGridProps) {
    return (
        <div className={cn(className)}>
            {items.map((item) => (
                <Card
                    key={`${item.title}-${item.description}`}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    variant={item.variant}
                    className={item.className}
                />
            ))}
        </div>
    );
}
