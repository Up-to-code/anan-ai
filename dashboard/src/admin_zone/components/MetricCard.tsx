import { cn } from "@/_core/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/public_zone/ui/tooltip";

interface MetricCardProps {
    title: string;
    value: string | number;
    info?: string;
    className?: string;
}

export function MetricCard({ title, value, info, className }: MetricCardProps) {
    return (
        <div className={cn("p-6 bg-white flex flex-col justify-center", className)}>
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <span className="text-sm font-medium">{title}</span>
                {info && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 cursor-default text-muted-foreground/50 hover:text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{info}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
        </div>
    );
}
