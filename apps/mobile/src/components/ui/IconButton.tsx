import { LucideIcon } from "lucide-react-native";
import { Pressable, PressableProps } from "react-native";
import { cn } from "@/lib/cn";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  active?: boolean;
  tone?: "light" | "panel" | "ghost";
  size?: "sm" | "default" | "lg";
};

/**
 * WHY:   Compact icon actions appear in headers, search bars, and property surfaces.
 * WHAT:  Renders a perfectly circular icon button with elegant dark mode and press states.
 * HOW:   Uses rounded-full geometry with subtle borders and precise sizing.
 */
export function IconButton({ icon: Icon, active, tone = "light", size = "default", className, ...props }: IconButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-11 w-11",
    lg: "h-14 w-14",
  };

  const iconSizes = {
    sm: 16,
    default: 20,
    lg: 24,
  };

  return (
    <Pressable
      {...props}
      className={cn(
        "items-center justify-center rounded-full transition-colors active:scale-95",
        sizeClasses[size],
        tone === "light" ? "bg-transparent border-0" : "",
        tone === "panel" ? "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" : "",
        tone === "ghost" ? "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800" : "",
        active && tone !== "ghost" ? "border-primary bg-primary/5 dark:bg-primary/10" : "",
        className,
      )}
    >
      <Icon 
        color={active ? "#2563EB" : tone === "light" ? "#64748B" : "#475569"} 
        size={iconSizes[size]} 
        strokeWidth={active ? 2.5 : 2} 
      />
    </Pressable>
  );
}
