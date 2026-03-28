import { ActivityIndicator, Pressable, PressableProps, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  loading?: boolean;
  size?: "default" | "sm" | "lg";
  textClassName?: string;
  className?: string;
};

/**
 * WHY:   The app needs one consistent action primitive for chat, search, and journey CTAs.
 * WHAT:  Renders a compact, modern button with primary, secondary, ghost, or destructive treatment.
 * HOW:   Uses rounded-full geometry (min-h-14 for standard), robust press states, and dark mode support.
 */
export function Button({ 
  label, 
  variant = "primary", 
  loading, 
  size = "default",
  className, 
  textClassName,
  disabled, 
  ...props 
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const isDestructive = variant === "destructive";

  const sizeClasses = {
    sm: "min-h-[44px] px-5 py-2",
    default: "min-h-[56px] px-6 py-3",
    lg: "min-h-[64px] px-8 py-4",
  };

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={cn(
        "items-center justify-center rounded-full transition-all active:scale-[0.97]",
        sizeClasses[size],
        isPrimary ? "bg-slate-900 dark:bg-slate-50" : "",
        isSecondary ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" : "",
        isGhost ? "bg-transparent active:bg-slate-100 dark:active:bg-slate-800" : "",
        isDestructive ? "bg-red-500" : "",
        (disabled || loading) ? "opacity-40" : "",
        className,
      )}
    >
      <View className="flex-row items-center gap-2">
        {loading ? (
          <ActivityIndicator 
            color={
              isPrimary 
                ? "var(--color-slate-50)" // Will effectively be white in light mode, slate-900 in dark mode (if we had CSS vars in RN). We'll use absolute colors for RN compat.
                : isDestructive ? "#FFFFFF" : "#64748B"
            } 
          />
        ) : null}
        <AppText
          className={cn(
            "font-cairo-black tracking-tight",
            size === "sm" ? "text-[14px]" : size === "lg" ? "text-[18px]" : "text-[16px]",
            isPrimary ? "text-white dark:text-slate-900" : "",
            isSecondary ? "text-slate-900 dark:text-slate-100" : "",
            isGhost ? "text-slate-600 dark:text-slate-400" : "",
            isDestructive ? "text-white" : "",
            textClassName,
          )}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
