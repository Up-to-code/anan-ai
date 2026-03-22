import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

/**
 * WHY:   The app needs one consistent action primitive for chat, search, and journey CTAs.
 * WHAT:  Renders a compact button with primary, secondary, or ghost treatment.
 * HOW:   Keeps spacing, press states, and text styling aligned with the mobile brand system.
 */
export function Button({ label, variant = "primary", loading, className, disabled, ...props }: ButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={cn(
        "min-h-12 items-center justify-center border px-4 py-3",
        isPrimary ? "border-brand bg-brand" : "",
        isSecondary ? "border-line bg-white" : "",
        variant === "ghost" ? "border-transparent bg-transparent" : "",
        disabled || loading ? "opacity-60" : "",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#2563EB"} />
      ) : (
        <AppText
          className={cn(
            "font-cairo-bold text-sm",
            isPrimary ? "text-white" : "",
            isSecondary ? "text-ink" : "",
            variant === "ghost" ? "text-brand" : "",
          )}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
