import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { cn } from "@/lib/cn";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

/**
 * Minimal button. Primary is solid blue fill, no border. Secondary is text-only.
 */
export function Button({ label, variant = "primary", loading, className, disabled, ...props }: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      className={cn(
        "min-h-12 items-center justify-center px-4 py-3",
        isPrimary ? "bg-brand" : "bg-transparent",
        disabled || loading ? "opacity-60" : "",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#2563EB"} />
      ) : (
        <AppText className={cn("font-cairo-bold text-sm", isPrimary ? "text-white" : "text-brand")}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
